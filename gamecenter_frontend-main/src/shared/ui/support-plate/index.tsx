import cx from "classnames";
import { Link } from "react-router";

import { bem } from "../../lib";

import sosIcon from "./sos.svg";
import orgcomIcon from "./orgcom.png";

import "./index.scss";

interface Props {
  mix?: string;
}

const b = bem("support-plate");
export const SupportPlate = ({ mix }: Props) => {
  return (
    <div className={b(null, null, mix)}>
      <span className={b("powered")}>
        organized by <b>org.com</b>
      </span>

      <div className={b("controls")}>
        <Link
          className={cx(
            "button button_view_primary button_size_s",
            b("sos-link"),
          )}
          to="/support"
          aria-label="открыть страницу связи с организатором"
        >
          <img src={sosIcon} alt="SOS" className={b("sos")} />
        </Link>

        <div className={b("brand-mark")}>
          <img src={orgcomIcon} alt="org.com" />
        </div>
      </div>
    </div>
  );
};
