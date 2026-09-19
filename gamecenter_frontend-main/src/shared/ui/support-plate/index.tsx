import cx from "classnames";
import { Link } from "react-router";

import { bem } from "../../lib";

import blinkMark from "../../assets/brand/blink-star-mark.svg";
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

        <Link
          className={cx(
            "button button_view_primary button_size_s",
            b("blink-link"),
          )}
          to="/blink"
          aria-label="открыть информацию о приложении Blink"
          title="Blink — друзья на карте, чаты и звонки"
        >
          <img src={blinkMark} alt="" className={b("blink-logo")} />
        </Link>

        <Link
          className={cx(
            "button button_view_primary button_size_s",
            b("orgcom-link"),
          )}
          to="/orgcom"
          aria-label="открыть информацию об ORG.COM"
          title="ORG.COM — организационный комитет СПбГУТ"
        >
          <img src={orgcomIcon} alt="" className={b("orgcom-logo")} />
        </Link>
      </div>
    </div>
  );
};
