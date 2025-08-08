import { Component, type PropsWithChildren } from 'react';

class BottomSheetModal extends Component<PropsWithChildren<{ onDismiss?: () => void }>, { visible: boolean }> {
  state = { visible: false };

  snapToIndex() {}
  snapToPosition() {}
  expand() {}
  collapse() {}
  close() {
    this.setState({ visible: false });
  }
  forceClose() {
    this.setState({ visible: false });
  }

  dismiss() {
    this.props.onDismiss?.();
    this.setState({ visible: false });
  }

  present() {
    this.setState({ visible: true });
  }

  render() {
    if (this.state.visible) {
      return <>{this.props.children}</>;
    }

    return null;
  }
}

module.exports = {
  BottomSheetModal,
};
