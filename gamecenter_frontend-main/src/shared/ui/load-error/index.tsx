import { Button } from "../button";

import "./index.scss";

interface Props {
  message: string;
  onRetry?: () => void;
}

export const LoadError = ({ message, onRetry }: Props) => (
  <div className="load-error" role="alert">
    <span>{message}</span>
    {onRetry && (
      <Button type="button" size="s" view="secondary" onClick={onRetry}>
        повторить
      </Button>
    )}
  </div>
);
