import { Accordion, AccordionDetails, AccordionSummary, CircularProgress, makeStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { isEmpty } from "lodash";
import React from "react";
import { getMeshModelComponent } from "../../../api/meshmodel";
import { iconMedium } from "../../../css/icons.styles";
import { useSnackbar } from "notistack";
import PatternServiceForm from "../../MesheryMeshInterface/PatternServiceForm";
// import { isEmptyObj } from "../../utils/utils";
// import PatternServiceForm from "./PatternServiceForm";

const useStyles = makeStyles((theme) => ({
  accordionRoot : {
    width : "100%",
  },
  heading : {
    fontSize : theme.typography.pxToRem(15),
    fontWeight : theme.typography.fontWeightRegular,
  },
}));

export default function LazyComponentForm({ component, ...otherprops }) {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);
  const [schemaSet, setSchemaSet] = React.useState({});
  const { enqueueSnackbar } = useSnackbar();

  async function expand(state) {
    if (!state) {
      setExpanded(false);
      return;
    }

    setExpanded(true);
    const { apiVersion, kind, model } = component;
    const { name : modelName, version } = model
    try {
      if (isEmpty(schemaSet)) {
        const res = await getMeshModelComponent(modelName, kind, version, apiVersion);
        if (res[0]) {
          setSchemaSet({
            workload : JSON.parse(res[0].schema), // has to be removed
          })
        } else {
          throw new Error("found null in component definition")
        }
      }
    } catch (error) {
      enqueueSnackbar(`error getting schema: ${error?.message}`, { variant : "error" })
    }
  }

  return (
    <div className={classes.accordionRoot}>
      <Accordion elevation={0} expanded={expanded} onChange={() => expand(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon style={iconMedium} />}>
          <Typography className={classes.heading}>
            {component.displayName}
          </Typography>
        </AccordionSummary>
        <LazyAccordionDetails expanded={expanded}>
          {isEmpty(schemaSet) ? <CircularProgress /> : <PatternServiceForm formData={{}} {...otherprops}
            // @ts-ignore
            schemaSet={schemaSet} />}
        </LazyAccordionDetails>
      </Accordion>
    </div>
  )
}

function LazyAccordionDetails(props) {
  if (!props.expanded) return <AccordionDetails />;

  // @ts-ignore // LEE: This behavior is more like what we need - https://codesandbox.io/s/upbeat-tesla-uchsb?file=/src/MyAccordion.js
  return <AccordionDetails>{props.children}</AccordionDetails>
}

