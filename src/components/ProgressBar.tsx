import React from "react";

interface ProgressBarProps {
  percentage: number;
  height?: string;
  showLabel?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  height = "8px",
  showLabel = true,
  color,
}) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const getColor = () => {
    if (color) return color;
    if (clampedPercentage < 30) return "var(--danger-color)";
    if (clampedPercentage < 70) return "var(--warning-color)";
    return "var(--success-color)";
  };

  return (
    <div className="progress-bar-container">
      {showLabel && (
        <div className="progress-label">
          <span className="progress-text">Progress</span>
          <span className="progress-percentage">
            {Math.round(clampedPercentage)}%
          </span>
        </div>
      )}

      <div className="progress-track" style={{ height }}>
        <div
          className="progress-fill"
          style={{
            width: `${clampedPercentage}%`,
            backgroundColor: getColor(),
          }}
        >
          {clampedPercentage > 10 && <div className="progress-shine" />}
        </div>
      </div>

      <style jsx>{`
        .progress-bar-container {
          width: 100%;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .progress-text {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .progress-percentage {
          color: var(--text-primary);
          font-weight: 600;
        }

        .progress-track {
          width: 100%;
          background: var(--bg-secondary);
          border-radius: 100px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          border-radius: 100px;
          transition: width 0.3s ease, background-color 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .progress-shine {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          animation: shine 2s infinite;
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
