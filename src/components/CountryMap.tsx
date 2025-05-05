import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

interface CountryData {
  country: string;
  clicks: number;
}

interface CountryMapProps {
  data: CountryData[];
  totalClicks: number;
}

export default function CountryMap({ data, totalClicks }: CountryMapProps) {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const colorScale = scaleLinear<string>()
    .domain([0, Math.max(...data.map(d => d.clicks))])
    .range(["#E3F2FD", "#1976D2"]);

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Clicks by Country
      </Typography>
      <Box sx={{ position: 'relative', height: '400px' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 100 }}
          onMouseMove={handleMouseMove}
        >
          <ZoomableGroup>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryData = data.find(
                    (d) => d.country.toLowerCase() === geo.properties.name.toLowerCase()
                  );
                  const clicks = countryData?.clicks || 0;
                  const percentage = totalClicks > 0 ? ((clicks / totalClicks) * 100).toFixed(1) : 0;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={countryData ? colorScale(clicks) : "#F5F5F5"}
                      stroke="#FFFFFF"
                      style={{
                        default: {
                          outline: "none",
                        },
                        hover: {
                          fill: "#2196F3",
                          outline: "none",
                        },
                        pressed: {
                          outline: "none",
                        },
                      }}
                      onMouseEnter={() => {
                        setTooltipContent(
                          `${geo.properties.name}: ${clicks} clicks (${percentage}%)`
                        );
                      }}
                      onMouseLeave={() => {
                        setTooltipContent("");
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
        {tooltipContent && (
          <Tooltip
            open={!!tooltipContent}
            title={tooltipContent}
            placement="top"
            arrow
            sx={{
              position: 'absolute',
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              pointerEvents: 'none',
            }}
          >
            <Box />
          </Tooltip>
        )}
      </Box>
    </Paper>
  );
} 