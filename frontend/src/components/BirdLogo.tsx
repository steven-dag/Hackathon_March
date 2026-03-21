import { Box, Typography } from "@mui/material";

/**
 * .birdie wordmark logo
 * light=true → white text for dark backgrounds
 * light=false (default) → gradient text for light backgrounds
 */
export default function BirdLogo({
  size = "md",
  light = false,
}: {
  size?: "sm" | "md" | "lg";
  light?: boolean;
}) {
  const fontSizes = { sm: "1rem", md: "1.25rem", lg: "1.7rem" };
  const iconSizes = { sm: 22, md: 28, lg: 38 };
  const fs = fontSizes[size];
  const is = iconSizes[size];

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, userSelect: "none" }}>
      {/* Bird icon */}
      <Box
        sx={{
          width: is,
          height: is,
          borderRadius: "50%",
          background: light
            ? "linear-gradient(135deg, #4ADE80 0%, #22c55e 100%)"
            : "linear-gradient(135deg, #00897B 0%, #1565C0 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: light
            ? "0 2px 12px rgba(74,222,128,0.4)"
            : "0 2px 8px rgba(0,137,123,0.35)",
        }}
      >
        <svg
          width={is * 0.6}
          height={is * 0.6}
          viewBox="0 0 24 24"
          fill={light ? "#0a0a0a" : "white"}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M22 4c0 0-7.5 1-10 5-1.5 2.4-1.2 5.1 0 7C8 19 4 20 2 20c2-1 3.5-3 4-5-2 1-4 1-4 1s4-2 5-5C8.5 7 14 4 22 4z" />
        </svg>
      </Box>

      {/* Wordmark */}
      <Typography
        component="span"
        sx={{
          fontSize: fs,
          fontWeight: 800,
          letterSpacing: "-0.5px",
          lineHeight: 1,
          ...(light
            ? { color: "white" }
            : {
                color: "transparent",
                background: "linear-gradient(90deg, #00897B 0%, #1565C0 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }),
        }}
      >
        .birdie
      </Typography>
    </Box>
  );
}
