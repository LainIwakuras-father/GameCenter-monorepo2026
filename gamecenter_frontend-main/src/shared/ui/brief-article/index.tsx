import React from "react";
import cx from "classnames";

import { bem, markdown2html } from "../../lib";

import "./index.scss";

interface Props {
  mix?: string;
  color: "gray" | "white";
  title: string;
  markdown?: string | null;
  image?: string | null;
  Footer?: React.FC;
  FooterContent?: React.ReactNode;
}

const b = bem("brief-article");

export const BriefArticle = ({
  mix,
  color,
  title,
  markdown,
  image,
  Footer,
  FooterContent,
}: Props) => {
  const text = markdown && markdown2html(markdown);

  return (
    <div className={cx(b(null, { color }), mix)}>
      <h3 className={b("title")}>{title}</h3>
      {text && (
        <div
          className={b("content")}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      )}
      {image && <img className={b("image")} src={image} alt={title} />}
      {Footer ? <Footer /> : null}
      {FooterContent ? FooterContent : null}
    </div>
  );
};
