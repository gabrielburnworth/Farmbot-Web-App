import * as React from "react";
import { t } from "../../../i18next_wrapper";
import { FBSelect, BlurableInput } from "../../../ui";
import { isUndefined } from "lodash";
import {
  ValueSelectionProps, GetSelectedValueProps, KnownValueSelectionProps,
} from "./interfaces";
import { Identifier, Resource } from "farmbot";
import { DropDownItem } from "../../../ui";
import { ResourceIndex } from "../../../resources/interfaces";
import { selectAllTools, maybeFindToolById } from "../../../resources/selectors";
import {
  PLANT_STAGE_LIST, PLANT_STAGE_DDI_LOOKUP, WEED_STAGE_DDI_LOOKUP,
  ALL_STAGE_LIST, ALL_STAGE_DDI_LOOKUP,
} from "../../../farm_designer/plants/edit_plant_status";
import {
  isCustomMetaField, KnownField, UPDATE_RESOURCE_DDIS,
} from "./field_selection";
import { DevSettings } from "../../../account/dev/dev_support";

export const ValueSelection = (props: ValueSelectionProps) =>
  <div className={"update-resource-step-value"}>
    <label onClick={() => DevSettings.futureFeaturesEnabled() && props.add({})}>
      {t("as")}
    </label>
    {isCustomMetaField(props.field) || (!isUndefined(props.field)
      && props.field !== KnownField.plant_stage
      && props.field !== KnownField.mounted_tool_id)
      ? <CustomMetaValue {...props} />
      : <KnownValue {...props} field={props.field} />}
  </div>;

const KnownValue = (props: KnownValueSelectionProps) =>
  <FBSelect
    extraClass={isUndefined(props.field) ? "disabled" : ""}
    list={props.resource.kind == "nothing"
      ? []
      : valuesList(props.resource, props.resources)}
    onChange={ddi => {
      props.update({ value: ddi.value },
        props.commitSelection);
    }}
    selectedItem={getSelectedValue({
      resourceIndex: props.resources,
      resource: props.resource,
      field: props.field,
      value: props.value,
    })} />;

const CustomMetaValue = (props: ValueSelectionProps) =>
  <div className="custom-meta-field">
    <BlurableInput type="text" name="value"
      allowEmpty={true}
      value={isUndefined(props.value) ? "" : "" + props.value}
      onCommit={e => {
        props.update({ value: e.currentTarget.value },
          props.commitSelection);
      }} />
  </div>;

const valuesList = (
  resource: Resource | Identifier,
  resources: ResourceIndex): DropDownItem[] => {
  const DDI = UPDATE_RESOURCE_DDIS();
  const stepResourceType =
    resource.kind == "identifier" ? undefined : resource.args.resource_type;
  switch (stepResourceType) {
    case "Device": return [
      DDI.NONE,
      ...selectAllTools(resources).filter(x => !!x.body.id)
        .map(x => ({ toolName: x.body.name, toolId: x.body.id }))
        .map(({ toolName, toolId }:
          { toolName: string | undefined, toolId: number }) =>
          ({ label: toolName || t("Untitled tool"), value: toolId })),
    ];
    case "GenericPointer": return [DDI.ACTIVE, DDI.REMOVED];
    case "Weed": return [DDI.ACTIVE, DDI.REMOVED];
    case "Plant": return PLANT_STAGE_LIST();
    default: return ALL_STAGE_LIST();
  }
};

const getSelectedValue = (props: GetSelectedValueProps): DropDownItem => {
  const DDI = UPDATE_RESOURCE_DDIS();
  if (isUndefined(props.field) || isUndefined(props.value)
    || props.resource.kind == "nothing") { return DDI.SELECT_ONE; }
  switch (props.field) {
    case KnownField.mounted_tool_id:
      const toolId = parseInt("" + props.value);
      if (toolId == 0) { return DDI.NONE; }
      const tool = maybeFindToolById(props.resourceIndex, toolId);
      if (!tool) { return { label: t("Unknown tool"), value: toolId }; }
      return {
        label: tool.body.name || t("Untitled tool"),
        value: toolId
      };
    case KnownField.plant_stage:
      const stepResourceType = props.resource.kind == "identifier"
        ? undefined : props.resource.args.resource_type;
      return getStageLookup(stepResourceType)["" + props.value]
        || { label: "" + props.value, value: "" + props.value };
  }
};

const getStageLookup = (resourceType: string | undefined) => {
  switch (resourceType) {
    case "Plant": return PLANT_STAGE_DDI_LOOKUP();
    case "Weed": return WEED_STAGE_DDI_LOOKUP();
    default: return ALL_STAGE_DDI_LOOKUP();
  }
};
