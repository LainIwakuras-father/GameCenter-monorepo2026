import "./index.scss";

interface Props {
  /** Short status text announced to assistive technologies. */
  message?: string;
}

/** A compact, consistent loading state for route-level data requests. */
export const LoadingState = ({ message = "Загрузка…" }: Props) => (
  <div
    className="loading-state"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span className="loading-state__spinner" aria-hidden="true" />
    <span className="loading-state__message">{message}</span>
  </div>
);
