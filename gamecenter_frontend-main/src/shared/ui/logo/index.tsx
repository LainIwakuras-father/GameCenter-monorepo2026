import cx from "classnames";

import logo from "../../assets/brand/logo-ic26.svg";

export const Logo = ({ mix }: { mix?: string }) => (
  <img className={cx("logo", mix)} src={logo} alt="ИграЦентр" />
);
