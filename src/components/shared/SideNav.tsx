export interface SideNavItem {
  id: string;
  label: string;
  defaultColor?: string;
}

interface SideNavProps {
  sections: SideNavItem[];
}

export default function SideNav({ sections }: SideNavProps) {
  return (
    <div className="side-nav" id="sideNav">
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`} data-s={s.id}>
          <span className="lbl">{s.label}</span>
          <span className="dot" style={s.defaultColor ? { background: s.defaultColor } : undefined}></span>
        </a>
      ))}
    </div>
  );
}
