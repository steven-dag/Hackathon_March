"""
Supabase REST API client using plain requests.
Bypasses the supabase Python SDK to avoid Python 3.14 compatibility issues.
"""

import os
import requests
from dotenv import load_dotenv
from typing import Any, Dict, List

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    import sys
    print("WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set", file=sys.stderr)

BASE_URL = f"{SUPABASE_URL}/rest/v1"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


class SupabaseTable:
    def __init__(self, table: str):
        self.table = table
        self.url = f"{BASE_URL}/{table}"
        self._filters: List[str] = []
        self._select_cols = "*"
        self._single = False

    def select(self, cols: str = "*"):
        self._select_cols = cols
        return self

    def eq(self, column: str, value: Any):
        self._filters.append((column, f"eq.{value}"))
        return self

    def single(self):
        self._single = True
        return self

    def insert(self, data: Dict | List):
        self._insert_data = data
        return self

    def _do_insert(self):
        resp = requests.post(self.url, json=self._insert_data, headers=HEADERS)
        resp.raise_for_status()
        result = resp.json()
        return _Result(result if isinstance(result, list) else [result])

    def update(self, data: Dict):
        return _PendingUpdate(self.url, data, self._filters[:])

    def execute(self):
        # If this was chained after insert()
        if hasattr(self, "_insert_data"):
            return self._do_insert()

        params = {"select": self._select_cols}
        for col, val in self._filters:
            params[col] = val

        headers = {**HEADERS}
        if self._single:
            headers["Accept"] = "application/vnd.pgrst.object+json"

        resp = requests.get(self.url, headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()

        if self._single:
            return _Result([data] if data else [])
        return _Result(data if isinstance(data, list) else [data])


class _PendingUpdate:
    def __init__(self, url: str, data: Dict, filters: List):
        self.url = url
        self.data = data
        self.filters = filters

    def eq(self, column: str, value: Any):
        self.filters.append((column, f"eq.{value}"))
        return self

    def execute(self):
        params = {}
        for col, val in self.filters:
            params[col] = val
        resp = requests.patch(self.url, json=self.data, headers=HEADERS, params=params)
        resp.raise_for_status()
        data = resp.json()
        return _Result(data if isinstance(data, list) else [data])


class _Result:
    def __init__(self, data: List):
        self.data = data if data else None


class SupabaseClient:
    def table(self, name: str) -> SupabaseTable:
        return SupabaseTable(name)


supabase = SupabaseClient()
