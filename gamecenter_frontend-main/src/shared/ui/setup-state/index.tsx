import "./index.scss";

interface Props {
  title: string;
  message: string;
}

/** Explains an expected-but-not-yet-configured event relation. */
export const SetupState = ({ title, message }: Props) => (
  <section className="setup-state" role="status" aria-live="polite">
    <span className="setup-state__mark" aria-hidden="true">
      !
    </span>
    <div className="setup-state__copy">
      <h2 className="setup-state__title">{title}</h2>
      <p className="setup-state__message">{message}</p>
    </div>
  </section>
);
