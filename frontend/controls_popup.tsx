import React from "react";
import { DirectionButton } from "./controls/move/direction_button";
import { getDevice } from "./device";
import { buildDirectionProps } from "./controls/move/direction_axes_props";
import { ControlsPopupProps } from "./controls/move/interfaces";
import { commandErr } from "./devices/actions";
import { mapPanelClassName } from "./farm_designer/map/util";
import { cameraBtnProps } from "./photos/capture_settings/camera_selection";
import { t } from "./i18next_wrapper";
import { getPathArray } from "./history";

export const ControlsPopup = (props: ControlsPopupProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isOpenClass = isOpen ? "open" : "";
  const { stepSize, xySwap, arduinoBusy, botOnline } = props;
  const directionAxesProps = buildDirectionProps(props);
  const rightLeft = xySwap ? "y" : "x";
  const upDown = xySwap ? "x" : "y";
  const movementDisabled = !isOpen || arduinoBusy || !botOnline;
  const commonProps = { steps: stepSize, disabled: movementDisabled };
  const camDisabled = cameraBtnProps(props.env);
  return <div
    className={`controls-popup ${isOpenClass} ${mapPanelClassName()}`}>
    <i className="fa fa-crosshairs" onClick={() => setIsOpen(!isOpen)} />
    <div className="controls-popup-menu-outer">
      <div className="controls-popup-menu-inner">
        <DirectionButton {...commonProps}
          axis={rightLeft}
          direction="right"
          directionAxisProps={directionAxesProps[rightLeft]} />
        <DirectionButton {...commonProps}
          axis={upDown}
          direction="up"
          directionAxisProps={directionAxesProps[upDown]} />
        <DirectionButton {...commonProps}
          axis={upDown}
          direction="down"
          directionAxisProps={directionAxesProps[upDown]} />
        <DirectionButton {...commonProps}
          axis={rightLeft}
          direction="left"
          directionAxisProps={directionAxesProps[rightLeft]} />
        <button
          className={
            `fa fa-camera arrow-button fb-button brown ${camDisabled.class}`}
          disabled={!isOpen || !botOnline}
          title={camDisabled.title || t("Take a photo")}
          onClick={camDisabled.click ||
            (() => getDevice().takePhoto().catch(commandErr("Photo")))} />
      </div>
    </div>
  </div>;
};

export const showControlsPopup = () => {
  const currentPage = getPathArray()[2] || "";
  const currentPanel = getPathArray()[3] || "";
  const pagesNotShown = ["account", "regimens"];
  const panelsNotShown = ["controls"];
  const hide = pagesNotShown.includes(currentPage)
    || (currentPage == "designer" && panelsNotShown.includes(currentPanel));
  return !hide;
};
