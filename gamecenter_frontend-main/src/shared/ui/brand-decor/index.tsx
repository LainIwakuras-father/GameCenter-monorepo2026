import star from "../../assets/brand/star.svg";
import qrCodes from "../../assets/brand/qr-codes.svg";
import barcodes from "../../assets/brand/barcodes.svg";
import flowerBlue from "../../assets/brand/flower-blue.svg";
import flowerPurple from "../../assets/brand/flower-purple.svg";
import flowerYellow from "../../assets/brand/flower-yellow.svg";
import personBlue from "../../assets/brand/person-blue.svg";

import "./index.scss";

export const BrandDecor = () => (
  <div className="brand-decor" aria-hidden="true">
    <img className="brand-decor__star" src={star} alt="" />
    <img className="brand-decor__qr" src={qrCodes} alt="" />
    <img className="brand-decor__barcodes" src={barcodes} alt="" />
    <img
      className="brand-decor__flower brand-decor__flower_blue"
      src={flowerBlue}
      alt=""
    />
    <img
      className="brand-decor__flower brand-decor__flower_purple"
      src={flowerPurple}
      alt=""
    />
    <img
      className="brand-decor__flower brand-decor__flower_yellow"
      src={flowerYellow}
      alt=""
    />
    <img className="brand-decor__person" src={personBlue} alt="" />
  </div>
);
