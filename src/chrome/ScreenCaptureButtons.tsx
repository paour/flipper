/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import {Button, ButtonGroup, writeBufferToFile} from 'flipper';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import expandTilde from 'expand-tilde';
import {remote} from 'electron';
import path from 'path';
import {reportPlatformFailures} from '../utils/metrics';
import config from '../utils/processConfig';
import BaseDevice from '../devices/BaseDevice';
import {State as Store} from '../reducers';
import open from 'open';

const CAPTURE_LOCATION = expandTilde(
  config().screenCapturePath || remote.app.getPath('desktop'),
);

type OwnProps = {};

type StateFromProps = {
  selectedDevice: BaseDevice | null | undefined;
};

type DispatchFromProps = {};

type State = {
  recording: boolean;
  recordingEnabled: boolean;
  capturingScreenshot: boolean;
};

export async function openFile(path: string | null) {
  if (!path) {
    return;
  }

  try {
    await open(path);
  } catch (e) {
    console.error(`Opening ${path} failed with error ${e}.`);
  }
}

function getFileName(extension: 'png' | 'mp4'): string {
  // Windows does not like `:` in its filenames. Yes, I know ...
  return `screencap-${new Date().toISOString().replace(/:/g, '')}.${extension}`;
}

type Props = OwnProps & StateFromProps & DispatchFromProps;
class ScreenCaptureButtons extends Component<Props, State> {
  videoPath: string | null | undefined;

  state = {
    recording: false,
    recordingEnabled: false,
    capturingScreenshot: false,
  };

  componentDidMount() {
    this.checkIfRecordingIsAvailable();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.selectedDevice !== this.props.selectedDevice) {
      this.checkIfRecordingIsAvailable(nextProps);
    }
  }

  checkIfRecordingIsAvailable = async (props: Props = this.props) => {
    const {selectedDevice} = props;
    const recordingEnabled = selectedDevice
      ? await selectedDevice.screenCaptureAvailable()
      : false;
    this.setState({recordingEnabled});
  };

  captureScreenshot: Promise<void> | any = () => {
    const {selectedDevice} = this.props;
    const pngPath = path.join(CAPTURE_LOCATION, getFileName('png'));
    if (selectedDevice != null) {
      reportPlatformFailures(
        selectedDevice
          .screenshot()
          .then(buffer => writeBufferToFile(pngPath, buffer))
          .then(path => openFile(path)),
        'captureScreenshot',
      );
    }
  };

  startRecording = async () => {
    const {selectedDevice} = this.props;
    if (!selectedDevice) {
      return;
    }
    const videoPath = path.join(CAPTURE_LOCATION, getFileName('mp4'));
    await selectedDevice.startScreenCapture(videoPath);

    this.setState({
      recording: true,
    });
  };

  stopRecording = async () => {
    const {selectedDevice} = this.props;
    if (!selectedDevice) {
      return;
    }
    const path = await selectedDevice.stopScreenCapture();
    this.setState({
      recording: false,
    });
    openFile(path);
  };

  onRecordingClicked = () => {
    if (this.state.recording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  };

  render() {
    const {recordingEnabled} = this.state;
    const {selectedDevice} = this.props;

    return (
      <ButtonGroup>
        <Button
          compact={true}
          onClick={this.captureScreenshot}
          icon="camera"
          title="Take Screenshot"
          disabled={!selectedDevice}
        />
        <Button
          compact={true}
          onClick={this.onRecordingClicked}
          icon={this.state.recording ? 'stop-playback' : 'camcorder'}
          pulse={this.state.recording}
          selected={this.state.recording}
          title="Make Screen Recording"
          disabled={!selectedDevice || !recordingEnabled}
        />
      </ButtonGroup>
    );
  }
}

export default connect<StateFromProps, DispatchFromProps, OwnProps, Store>(
  ({connections: {selectedDevice}}) => ({
    selectedDevice,
  }),
)(ScreenCaptureButtons);
