import {
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  MoreHorizontal,
  School,
  TrendingUp,
} from "lucide-react";

export function DashboardPreview() {
  return (
    <div className="preview-stage" aria-label="Amaliyot paneli namunasi">
      <div className="preview-window">
        <div className="preview-sidebar">
          <div className="preview-mini-logo">
            C<span>·</span>
          </div>
          <LayoutDashboard className="selected" />
          <ClipboardList />
          <CalendarDays />
          <School />
        </div>
        <div className="preview-content">
          <div className="preview-top">
            <span>
              UMUMIY KO‘RINISH <ChevronDown size={12} />
            </span>
            <span className="preview-avatar">M</span>
          </div>
          <div className="preview-greeting">
            Xayrli kun, talaba <span>!</span>
          </div>
          <p>Amaliyot jarayoningiz bir joyda.</p>
          <div className="preview-main-card">
            <div className="preview-card-head">
              <span>4+2 PEDAGOGIK AMALIYOT</span>
              <MoreHorizontal size={18} />
            </div>
            <div className="preview-card-body">
              <div>
                <small>UMUMIY JARAYON</small>
                <strong>
                  68<span>%</span>
                </strong>
                <div className="preview-progress">
                  <i />
                </div>
                <small>Davom etmoqda</small>
              </div>
              <div className="preview-ring">
                <span>68%</span>
              </div>
            </div>
          </div>
          <div className="preview-mini-grid">
            <div>
              <span className="mini-icon purple">
                <ClipboardList size={16} />
              </span>
              <small>TOPSHIRIQLAR</small>
              <strong>12 / 18</strong>
              <span className="mini-foot">
                6 ta qoldi <TrendingUp size={13} />
              </span>
            </div>
            <div>
              <span className="mini-icon green">
                <CalendarDays size={16} />
              </span>
              <small>DAVOMAT</small>
              <strong>24 kun</strong>
              <span className="mini-foot">
                <Check size={13} /> Qayd etilgan
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="float-status">
        <span className="float-check">
          <Check size={14} />
        </span>
        <div>
          <strong>Amaliyot faol</strong>
          <small>Jarayon davom etmoqda</small>
        </div>
        <span className="status-dot" />
      </div>
      <div className="float-week">
        <span>4+2</span>
        <small>NAZARIYA + AMALIYOT</small>
      </div>
    </div>
  );
}
