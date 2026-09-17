import React from "react";

import { Page } from "../page";

export class ErrorBoundary extends React.Component<React.PropsWithChildren> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  state: { hasError: boolean };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(error);
    console.error(errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Page>
          <h2 style={{ textAlign: "center" }}>
            Что-то пошло не так. <br />
            Обновите страницу или обратитесь к организатору.
          </h2>
        </Page>
      );
    }

    return this.props.children;
  }
}
