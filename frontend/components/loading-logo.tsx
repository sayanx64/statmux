'use client'

/**
 * LoadingLogo — animated statmux loader.
 *
 * Extracted from statmux_loader.html. CSS lives inside a scoped <style> tag
 * with unique class-name prefixes (sm-*) so repeated renders / concurrent
 * instances don't clobber each other. The animation is pure CSS keyframes
 * and restarts cleanly on every mount without jarring flashes.
 */
export function LoadingLogo({ size = 80 }: { size?: number }) {
  return (
    <>
      <style>{`
        .sm-pane{opacity:0;transform-box:fill-box;transform-origin:center;transform:scale(.85);}
        .sm-pane-left{animation:smPaneLeft 2.6s ease-in-out infinite;}
        .sm-pane-tr{animation:smPaneTR 2.6s ease-in-out infinite;}
        .sm-pane-br{animation:smPaneBR 2.6s ease-in-out infinite;}

        @keyframes smPaneLeft{
          0%,8%{opacity:0;transform:scale(.85);}
          18%{opacity:1;transform:scale(1);}
          88%{opacity:1;transform:scale(1);}
          100%{opacity:0;transform:scale(.85);}
        }
        @keyframes smPaneTR{
          0%,16%{opacity:0;transform:scale(.85);}
          26%{opacity:1;transform:scale(1);}
          88%{opacity:1;transform:scale(1);}
          100%{opacity:0;transform:scale(.85);}
        }
        @keyframes smPaneBR{
          0%,24%{opacity:0;transform:scale(.85);}
          34%{opacity:1;transform:scale(1);}
          88%{opacity:1;transform:scale(1);}
          100%{opacity:0;transform:scale(.85);}
        }

        .sm-dot{transform-box:fill-box;transform-origin:center;}
        .sm-dot-a{animation:smDotPulse 2.6s ease-in-out infinite;animation-delay:.1s;}
        .sm-dot-b{animation:smDotPulse 2.6s ease-in-out infinite;animation-delay:.25s;}
        .sm-dot-c{animation:smDotPulse 2.6s ease-in-out infinite;animation-delay:.4s;}
        @keyframes smDotPulse{
          0%,40%{transform:scale(1);opacity:.6;}
          45%{transform:scale(1.5);opacity:1;}
          50%{transform:scale(1);opacity:.6;}
          55%{transform:scale(1.5);opacity:1;}
          60%,100%{transform:scale(1);opacity:.6;}
        }

        .sm-prompt{opacity:0;animation:smPromptIn 2.6s ease-in-out infinite;}
        @keyframes smPromptIn{
          0%,18%{opacity:0;}
          26%{opacity:1;}
          88%{opacity:1;}
          100%{opacity:0;}
        }
        .sm-cursor{animation:smBlink 1s steps(1,end) infinite;}
        @keyframes smBlink{0%,49%{opacity:1;}50%,100%{opacity:0;}}

        .sm-bar{transform-box:fill-box;transform-origin:bottom;transform:scaleY(0);}
        .sm-bar1{animation:smBarGrow 2.6s ease-in-out infinite;animation-delay:0s;}
        .sm-bar2{animation:smBarGrow 2.6s ease-in-out infinite;animation-delay:.06s;}
        .sm-bar3{animation:smBarGrow 2.6s ease-in-out infinite;animation-delay:.12s;}
        .sm-bar4{animation:smBarGrow 2.6s ease-in-out infinite;animation-delay:.18s;}
        .sm-bar5{animation:smBarGrow 2.6s ease-in-out infinite;animation-delay:.24s;}
        @keyframes smBarGrow{
          0%,38%{transform:scaleY(0);}
          50%{transform:scaleY(1);}
          88%{transform:scaleY(1);}
          100%{transform:scaleY(0);}
        }

        .sm-spark{stroke-dasharray:60;stroke-dashoffset:60;opacity:0;animation:smSparkDraw 2.6s ease-in-out infinite;}
        @keyframes smSparkDraw{
          0%,42%{opacity:0;stroke-dashoffset:60;}
          46%{opacity:1;}
          64%{stroke-dashoffset:0;}
          88%{opacity:1;stroke-dashoffset:0;}
          100%{opacity:0;stroke-dashoffset:0;}
        }
      `}</style>

      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        aria-label="Loading statmux…"
        role="img"
      >
        <rect x="6" y="6" width="188" height="188" rx="42" fill="#0b0d10" stroke="#242933" strokeWidth="2"/>

        <g className="sm-pane sm-pane-left">
          <rect x="24" y="24" width="70" height="152" rx="10" fill="#12151a" stroke="#242933" strokeWidth="1.5"/>
          <circle className="sm-dot sm-dot-a" cx="34" cy="36" r="4" fill="#34d399"/>
          <text className="sm-prompt" x="59" y="116" fontFamily="'JetBrains Mono','Fira Code',monospace" fontSize="46" fontWeight="700" fill="#34d399" textAnchor="middle">
            {">"}
            <tspan className="sm-cursor">_</tspan>
          </text>
        </g>

        <g className="sm-pane sm-pane-tr">
          <rect x="106" y="24" width="70" height="68" rx="10" fill="#12151a" stroke="#242933" strokeWidth="1.5"/>
          <circle className="sm-dot sm-dot-b" cx="116" cy="36" r="4" fill="#60a5fa"/>
          <rect className="sm-bar sm-bar1" x="120" y="58" width="6" height="24" fill="#60a5fa"/>
          <rect className="sm-bar sm-bar2" x="131" y="50" width="6" height="32" fill="#60a5fa"/>
          <rect className="sm-bar sm-bar3" x="142" y="42" width="6" height="40" fill="#60a5fa"/>
          <rect className="sm-bar sm-bar4" x="153" y="54" width="6" height="28" fill="#60a5fa"/>
          <rect className="sm-bar sm-bar5" x="164" y="46" width="6" height="36" fill="#60a5fa"/>
        </g>

        <g className="sm-pane sm-pane-br">
          <rect x="106" y="108" width="70" height="68" rx="10" fill="#12151a" stroke="#242933" strokeWidth="1.5"/>
          <circle className="sm-dot sm-dot-c" cx="116" cy="120" r="4" fill="#fbbf24"/>
          <polyline className="sm-spark" points="120,158 132,150 143,154 154,140 165,146" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      </svg>
    </>
  )
}
