/* global localStorage */

import React, { useEffect, useState, useRef, useCallback } from "react";

import {
  Box,
  Flex,
  Text,
  Button,
  Image,
  Link,
  Input,
  Radio,
  Divider,
  useTheme,
  
} from "@blend-ui/core";

import { Tabs, Tab, TabList, TabPanel, TabPanelList } from "@blend-ui/tabs";

import { useToast, ToastContextProvider } from "@blend-ui/toast";

import {
  useAppContext,
  useIsMountedRef,
  listAppsQuery,
  addAppVersionMutation,
  getPrifinaUserQuery,
  updateUserProfileMutation,
  useUserMenu,
  withUsermenu,
  i18n,
  createClient,
} from "@prifina-apps/utils";

i18n.init();

//import { useAppContext } from "../lib/contextLib";
// import { API as GRAPHQL, Auth } from "aws-amplify";
// import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync";

import { useHistory } from "react-router-dom";

import moment from "moment";

const axios = require("axios");

import { StyledBox } from "../../components/DefaultBackground";

import UploadApp from "../../components/UploadApp";

import PropTypes from "prop-types";
import { DevConsoleSidebar } from "../../components/components";

import dashboardBanner from "../../assets/dashboard-banner.png";

import docs from "../../assets/docs.png";
import starterResources from "../../assets/starterResources.png";
import slackResources from "../../assets/slackResources.png";
import zendeskResources from "../../assets/zendeskResources.png";

import * as C from "../../components/components";
import { DevConsoleLogo } from "../../components/DevConsoleLogo";

import CreateProjectModal from "../components/CreateProjectModal";

import Table from "../../components/Table";
import BlendIcon from "@blend-ui/icons/dist/esm/BlendIcon";

import mdiPowerPlug from "@iconify/icons-mdi/power-plug";
import mdiZipBoxOutline from "@iconify/icons-mdi/zip-box-outline";
import mdiArrowLeft from "@iconify/icons-mdi/arrow-left";
import bxsInfoCircle from "@iconify/icons-bx/bxs-info-circle";
import baselineWeb from "@iconify/icons-mdi/table";

//sidebar icons
import viewDashboard from "@iconify/icons-mdi/view-dashboard";
import mdiWidget from "@iconify/icons-mdi/widgets";
import mdiBookOpenVariant from "@iconify/icons-mdi/book-open-variant";

import hazardSymbol from "@iconify/icons-mdi/warning";
import successTick from "@iconify/icons-mdi/tick-circle";

import bxsEdit from "@iconify/icons-bx/bx-edit-alt";

import {
  AddRemoveDataSources,
  ControlAddedDataSources,
  DataSourceForm,
  ApiForm,
} from "../components/helper";

// Create a default prop getter
const defaultPropGetter = () => ({});

// const Content = ({
//   Component,

//   initials,
//   notificationCount,
//   updateNotificationHandler,
//   appSyncClient,
//   activeUser,

//   ...props
// }) => {
//   const userMenu = useUserMenu();
//   console.log(
//     "USERMENU DEV APP INIT  ",
//     { ...props },

//     initials,
//     notificationCount,
//     typeof updateNotificationHandler,
//     appSyncClient,
//     activeUser,
//   );

//   userMenu.setClientHandler(appSyncClient);
//   userMenu.setActiveUser(activeUser);
//   useEffect(() => {
//     userMenu.show({
//       initials: initials,
//       effect: { hover: { width: 42 } },
//       notifications: notificationCount,
//       RecentApps: [],
//       PrifinaGraphQLHandler: GRAPHQL,
//       prifinaID: activeUser.uuid,
//     });
//   }, []);

//   updateNotificationHandler(userMenu.onUpdate);

//   return <Component data={props.data} currentUser={props.currentUser} />;
// };

// Content.propTypes = {
//   Component: PropTypes.elementType.isRequired,
//   initials: PropTypes.string,
//   notificationCount: PropTypes.number,
//   updateNotificationHandler: PropTypes.func,
//   appSyncClient: PropTypes.instanceOf(Object),
//   activeUser: PropTypes.instanceOf(Object),
//   currentUser: PropTypes.instanceOf(Object),
//   data: PropTypes.instanceOf(Array),
// };

const Main = ({
  // data,
  currentUser,
}) => {
  // const history = useHistory();

  const { colors } = useTheme();

  const toast = useToast();
  const [differenceDataSources, setDifferenceDataSources] = useState(false);
  // const [permDataSource, setPermDataSource] = useState([]);

  const versionStatus = [
    "init",
    "received",
    "review",
    "review",
    "review",
    "published",
  ];

  /////--------------------------------------------------------------------DYLANS WORK

  const [file, setFile] = useState();
  const [saved, setSaved] = useState(false);
  const [savedResources, setSavedResources] = useState(false);
  const [savedBuild, setSavedBuild] = useState(false);

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const url =
      "https://api-eu-west-2.graphcms.com/v2/ckzd3vyci1bp301z14b775t0o/master/upload";
    const formData = new FormData();
    formData.append("fileUpload", file);
    console.log(file);
    console.log(formData);
    // formData.append('fileName', file.name);
    const config = {
      headers: {
        Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE2NDQ0MzcyNTksImF1ZCI6WyJodHRwczovL2FwaS1ldS13ZXN0LTIuZ3JhcGhjbXMuY29tL3YyL2NremQzdnljaTFicDMwMXoxNGI3NzV0MG8vbWFzdGVyIiwiaHR0cHM6Ly9tYW5hZ2VtZW50LW5leHQuZ3JhcGhjbXMuY29tIl0sImlzcyI6Imh0dHBzOi8vbWFuYWdlbWVudC5ncmFwaGNtcy5jb20vIiwic3ViIjoiMzVhNmMxNTMtMmQxNS00ZjE2LWE4OTgtMTgyYTBlYzliY2I5IiwianRpIjoiY2t6ZnpoaHdpMTZhYTAxejIweWZmZms5YiJ9.f3nj1nk7m7mwEKx9PMafsbG9balRtuRl91bV8BBbqKceoS3C-HELxFpbbn4Y4zQL5I_7eI0uheeXaiM0vDkXyOXA11Y_wBgQBD4eYyQwtEB5SsO7p7ZgVXqw3lK7h4ojP2QW1LbgbX1RLK_4wqRz7ItK1HT5ve5SGuUiiBaQJY2nBK5ElMwJiS4cSzHwb3K7c9vOsIO92XLlDsyUR7A2ABGcovITaQ6jTY4Udh6hvjIqQk4hhfOthmAST_Mpb4bIzqkMVs8EEPWh_9z8WnSf-PS35B4Wh9xOLXrLSL58CLV4QZodVV3Tor3BOS93SpJnF14tFJ1XC6X9zyty7gqTLj6dxGzTK9ru501I4wgc3W4lVtdDciLy4Qe5_j9kkQdMnJb2PbmV24SOsNyTgOb5n0yQFcCSy_DGAf4CWyrXzzrPIM5VrbL_dOe2Hcui1O7xKf74CuQYJRDt08MtJXgPEFDdpfidr7riBqu6DB_7L2RcsrerOsiy3GSr_9eY2I9x-Pv8NMBeNsrKS_M-j1n0PbwamgQKHYXrGMQf1LXNHRyiLAtHYI0GTL-6Xx0wNfiqUc_GXvsd0LWqAtfFClIThFpJAER-rOcXCn7eaRY2Gnoi7JiCx_xw0qbxQ1CFZlPB_Xgzhj-xG7oRPucXsmXlzeAxTg-rUsj_zZkrHX2D3iY`,
        // 'content-type': 'multipart/form-data',
      },
    };
    axios.post(url, formData, config).then(response => {
      console.log(response.data);
    });
  }

  const [value, setValue] = React.useState("1");

  const [data, setData] = useState([]);

  // let data = [  ];

 

  const saveChanges = async () => {
    const updateAppDetails = {
      operationName: "updateAppDetails",
      query: `
      mutation updateAppDetails($appType: AppType, $id: ID, $name: String) {
        updateApp(data: {name: $name, appType: $appType}, where: {id: $id}) {
          id
        }
      }`,
      variables: {
        id: allValues.id,
        name: allValues.newName,
        appType: allValues.newType,
      },
    };
    const response = await axios({
      url: "https://api-eu-west-2.graphcms.com/v2/ckzd3vyci1bp301z14b775t0o/master",
      method: "post",
      headers: headers,
      data: updateAppDetails,
    });
    console.log(response);
    if (response.status === 200) {
      setAllValues({
        ...allValues,
        name: allValues.newName,
        type: allValues.newType,
      });
      setSaved(true);
      toast.success("Project name updated successfully", {});
    }
  };

  const warning = () => {
    if (
      allValues.name !== allValues.newName ||
      allValues.type !== allValues.newType
    ) {
      return (
        
        <Flex alignItems="center">
          <Text fontSize="xs">Unsaved Changes</Text>
          <div style={{ marginLeft: 5 }}>
            <BlendIcon
              size="18px"
              iconify={hazardSymbol}
              className="icon"
              color="orange"
            />
          </div>
          <Button
            ml="8px"
            onClick={() => {
              saveChanges();
            }}
            isLoading={true}
          >
            Save Changes
          </Button>
        </Flex>
      );
    } else if (saved) {
      {
        console.log("Testing");
      }

      return (
        <Flex alignItems="center">
          <Text fontSize="xs">Changes Saved</Text>
          <div style={{ marginLeft: 5 }}>
            <BlendIcon
              size="18px"
              iconify={successTick}
              className="icon"
              color="green"
            />
          </div>
          <Button disabled colorStyle="red" ml="8px">
            Save Changes
          </Button>
        </Flex>
      );
    } else {
      return (
        <Flex alignItems="center">
          <Text fontSize="xs">No Unsaved Changes</Text>
          <Button disabled colorStyle="red" ml="8px">
            Save Changes
          </Button>
        </Flex>
      );
    }
  };

  const warningResources = () => {
    if (
      differenceDataSources
    ) {
      return (
        <Flex alignItems="center">
          
          <Text fontSize="xs">Unsaved Changes</Text>
          <div style={{ marginLeft: 5 }}>
            <BlendIcon
              size="18px"
              iconify={hazardSymbol}
              className="icon"
              color="orange"
            />
          </div>
          <Button
            ml="8px"
            onClick={() => {
              saveChangesResources();
              // setPermDataSource(...dataSource.concat(apiData))
              // setSavedResources(true)
            }}
            
          >
            Save Changes
          </Button>
        </Flex>
      );
    } else if (savedResources) {
      {
        console.log("Testing");
      }

      return (
        <Flex alignItems="center">
          <Text fontSize="xs">Changes Saved</Text>
          <div style={{ marginLeft: 5 }}>
            <BlendIcon
              size="18px"
              iconify={successTick}
              className="icon"
              color="green"
            />
          </div>
          <Button disabled colorStyle="red" ml="8px">
            Save Changes
          </Button>
        </Flex>
      );
    } else {
      return (
        <Flex alignItems="center">
          <Text fontSize="xs">No Unsaved Changes</Text>
          <Button disabled colorStyle="red" ml="8px">
            Save Changes
          </Button>
        </Flex>
      );
    }
  };

  let handleVersionChange = (e) => {
    
    let inputValue = e.target.value
    var letters = /^[0-9|.]+$/
    console.log("INPUT VALUE", inputValue)
    console.log("INPUT VALUE", inputValue.slice(-1))
    console.log("INPUT VALUE", inputValue.slice(-1)==='.')
    console.log("INPUT VALUE", parseFloat([inputValue,'.0'].join('')))
    if ((inputValue.slice(-1).match(letters))){
      setAllValues({
        ...allValues,
        newVersion: inputValue

      })
    }


  }

  const warningBuild = () => {
    if (
      allValues.version!==allValues.newVersion
    ) {
      return (
        <Flex alignItems="center">
          
          <Text fontSize="xs">Unsaved Changes</Text>
          <div style={{ marginLeft: 5 }}>
            <BlendIcon
              size="18px"
              iconify={hazardSymbol}
              className="icon"
              color="orange"
            />
          </div>
          <Button
            ml="8px"
            onClick={() => {
              saveChangesBuild();
              // setPermDataSource(...dataSource.concat(apiData))
              // setSavedResources(true)
            }}
            
          >
            Save Changes
          </Button>
        </Flex>
      );
    } else if (savedBuild) {
      {
        console.log("Testing");
      }

      return (
        <Flex alignItems="center">
          <Text fontSize="xs">Changes Saved</Text>
          <div style={{ marginLeft: 5 }}>
            <BlendIcon
              size="18px"
              iconify={successTick}
              className="icon"
              color="green"
            />
          </div>
          <Button disabled colorStyle="red" ml="8px">
            Save Changes
          </Button>
        </Flex>
      );
    } else {
      return (
        <Flex alignItems="center">
          <Text fontSize="xs">No Unsaved Changes</Text>
          <Button disabled colorStyle="red" ml="8px">
            Save Changes
          </Button>
        </Flex>
      );
    }
  };

  const buttons = () => {
    console.log(allValues);
    if (allValues.newType === "App") {
      return (
        <Flex flexDirection="row" alignItems="center" mr="20px">
          <Flex flexDirection="row" alignItems="center" mr="15px">
            <Radio
              fontSize="8px"
              value="1"
              onClick={() => {
                setAllValues({ ...allValues, newType: "Widget" });
              }}
            />
            <Text fontSize="xs">{i18n.__("widget")}</Text>
          </Flex>
          <Flex flexDirection="row" alignItems="center">
            <Radio
              checked
              fontSize="10px"
              value="2"
              onClick={() => {
                setAllValues({ ...allValues, newType: "App" });
              }}
            />
            <Text fontSize="xs">Application</Text>
          </Flex>
        </Flex>
      );
    } else if (allValues.newType === "Widget") {
      return (
        <Flex flexDirection="row" alignItems="center" mr="20px">
          <Flex flexDirection="row" alignItems="center" mr="15px">
            <Radio
              checked
              fontSize="10px"
              value="1"
              onClick={() => {
                setAllValues({ ...allValues, newType: "Widget" });
              }}
            />
            <Text fontSize="xs">{i18n.__("widget")}</Text>
          </Flex>
          <Flex flexDirection="row" alignItems="center">
            <Radio
              fontSize="10px"
              value="2"
              onClick={() => {
                setAllValues({ ...allValues, newType: "App" });
              }}
            />
            <Text fontSize="xs">Application</Text>
          </Flex>
        </Flex>
      );
    }
  };

  const handleNameChange = event =>
    setAllValues({
      ...allValues,
      // title: widgets.current[w].title,
      newName: event.target.value,
    });

  const fetchApps = async e => {
    try {
      const repsonse = await axios({
        url: "https://api-eu-west-2.graphcms.com/v2/ckzd3vyci1bp301z14b775t0o/master",
        method: "post",
        headers: headers,
        data: getAppsQuery,
      });
      console.log(repsonse);
      setData(repsonse.data.data.apps);

      return data.length > 0 && <Table columns={Columns} data={data} />;

      // history.push("/");
    } catch (e) {
      console.log("error ", e);
    }
  };

  const saveChangesBuild = async() => {
        const updateAppDetails = {
          "operationName":"updateVersion",
          "query": `
          mutation updateVersion($id: ID, $version: Float) {
            updateApp(data: {version: $version}, where: {id: $id}){
              id
            }
          }
          `,
          "variables": {"id": allValues.id, "version": parseFloat(allValues.newVersion)}
        }
        const response = await axios({
          url: "https://api-eu-west-2.graphcms.com/v2/ckzd3vyci1bp301z14b775t0o/master",
          method: 'post',
          headers: headers,
          data: updateAppDetails
        });
        console.log(response)
      
    setAllValues({
      ...allValues,
      version: allValues.newVersion

    })
    setSavedBuild(true)
    toast.success("Project build saved successfully", {});

  }

  const saveChangesResources = async() => {
    const dataSources = apiData.data
    let clonedArray = JSON.parse(JSON.stringify(dataSources))
    clonedArray = dataSources.map(a => {return {...a}})
    let clonedArray2 = JSON.parse(JSON.stringify(dataSources))
    clonedArray2 = dataSources.map(a => {return {...a}})
    let x=0
    apiData.data.forEach(async data=>{
      if(apiData.history.some(item => item.id === data.id)){
        const updateAppDetails = {
          "operationName":"updateAppDetails",
          "query": `
          mutation updateAppDetails($id: ID, $details: String, $isAdded: Boolean) {
            updateApi(data: {desc: $details, added: $isAdded}, where: {id: $id}) {
              id
            }
          }`,
          "variables": {"id": data.id, "details": data.details, "isAdded": data.isAdded}
        }
        const response = await axios({
          url: "https://api-eu-west-2.graphcms.com/v2/ckzd3vyci1bp301z14b775t0o/master",
          method: 'post',
          headers: headers,
          data: updateAppDetails
        });
        console.log(response)
      } else {
        const createAppDetails = {
          "operationName":"createAppDetails",
          "query": `
          mutation createAppDetails($id: ID, $url: String, $details: String, $isAdded: Boolean) {
            createApi(data: {app: {connect: {id: $id}},url: $url, desc: $details, added: $isAdded}) {
              id
            }
          }`,
          "variables": {"id": allValues.id, "url": data.text, "details": data.details, "isAdded": data.isAdded}
        }
        const response = await axios({
          url: "https://api-eu-west-2.graphcms.com/v2/ckzd3vyci1bp301z14b775t0o/master",
          method: 'post',
          headers: headers,
          data: createAppDetails
        });
        clonedArray[x].id=response.data.data.createApi.id
        clonedArray2[x].id=response.data.data.createApi.id
        console.log(response)
      }
      x++

    })
    setApiData({
      data: clonedArray,
      history: clonedArray2

    })
    setSavedResources(true)
    setDifferenceDataSources(false)
    toast.success("Project data sources saved successfully", {});

  }

  const headers = {
    "content-type": "application/json",
    Authorization:
      "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE2NDQ0MzcyNTksImF1ZCI6WyJodHRwczovL2FwaS1ldS13ZXN0LTIuZ3JhcGhjbXMuY29tL3YyL2NremQzdnljaTFicDMwMXoxNGI3NzV0MG8vbWFzdGVyIiwiaHR0cHM6Ly9tYW5hZ2VtZW50LW5leHQuZ3JhcGhjbXMuY29tIl0sImlzcyI6Imh0dHBzOi8vbWFuYWdlbWVudC5ncmFwaGNtcy5jb20vIiwic3ViIjoiMzVhNmMxNTMtMmQxNS00ZjE2LWE4OTgtMTgyYTBlYzliY2I5IiwianRpIjoiY2t6ZnpoaHdpMTZhYTAxejIweWZmZms5YiJ9.f3nj1nk7m7mwEKx9PMafsbG9balRtuRl91bV8BBbqKceoS3C-HELxFpbbn4Y4zQL5I_7eI0uheeXaiM0vDkXyOXA11Y_wBgQBD4eYyQwtEB5SsO7p7ZgVXqw3lK7h4ojP2QW1LbgbX1RLK_4wqRz7ItK1HT5ve5SGuUiiBaQJY2nBK5ElMwJiS4cSzHwb3K7c9vOsIO92XLlDsyUR7A2ABGcovITaQ6jTY4Udh6hvjIqQk4hhfOthmAST_Mpb4bIzqkMVs8EEPWh_9z8WnSf-PS35B4Wh9xOLXrLSL58CLV4QZodVV3Tor3BOS93SpJnF14tFJ1XC6X9zyty7gqTLj6dxGzTK9ru501I4wgc3W4lVtdDciLy4Qe5_j9kkQdMnJb2PbmV24SOsNyTgOb5n0yQFcCSy_DGAf4CWyrXzzrPIM5VrbL_dOe2Hcui1O7xKf74CuQYJRDt08MtJXgPEFDdpfidr7riBqu6DB_7L2RcsrerOsiy3GSr_9eY2I9x-Pv8NMBeNsrKS_M-j1n0PbwamgQKHYXrGMQf1LXNHRyiLAtHYI0GTL-6Xx0wNfiqUc_GXvsd0LWqAtfFClIThFpJAER-rOcXCn7eaRY2Gnoi7JiCx_xw0qbxQ1CFZlPB_Xgzhj-xG7oRPucXsmXlzeAxTg-rUsj_zZkrHX2D3iY",
  };
  const getAppsQuery = {
    "operationName":"getApps",
    "query": `
    query getApps {
      apps {
        id
        appId
        appType
        title
        name
        appStatus
        version
        updatedAt
        compatibility
        languages
        ageRating
        category
        tagline
        developer
        description {
          html
        }
        icon {
          url
        }
        screenshots {
          url
        }
        dataSource {
          __typename
          ... on Api {
            id
            url
            desc
            added
          }
          ... on UserCloud {
            id
            title
            desc
          }
        }
      }
    }`,
  "variables": ""}
  // let data = [
  //   {
  //     "color": "purple",
  //     "type": "minivan",
  //     "registration": new Date('2017-01-03'),
  //     "capacity": 7
  //   },
  //   {
  //     "color": "red",
  //     "type": "station wagon",
  //     "registration": new Date('2018-03-03'),
  //     "capacity": 5
  //   }
  // ]

  //---------------------------------------------------Dylan's work

  const appTypes = ["Widget", "App"];

  const [allValues, setAllValues] = useState({
    title: "",
    description: "",
    icon: "",
    screenshots: [],
    developer: "",
    category: "",
    languages: "",
    ageRating: "",
    lastUpdated: "",
    compatibility: []

  });



  const onRowClick = (state, rowInfo, column, instance) => {
    return {
      onClick: e => {},
    };
  };

  const Columns = [
    {
      Header: "Name",
      accessor: "name",
      Cell: props => {
        return (
          <Text
            onClick={() => {
              setStep(3);
              setSaved(false);
              // setAllValues({
              //   ...allValues,
              //   // title: widgets.current[w].title,
              //   name: props.cell.value,
              //   newName: props.cell.value,
              //   id: props.row.values.id,
              //   type: props.row.values.appType,
              //   newType: props.row.values.appType,
              // });
              if (props.row.values.version===null){
                setAllValues({
                  ...allValues,
                  // title: widgets.current[w].title,
                  name: props.cell.value,
                  newName: props.cell.value,
                  id: props.row.values.id,
                  type: props.row.values.appType,
                  newType: props.row.values.appType,
                  version: "",
                  newVersion: ""
                });

              } else {
                setAllValues({
                  ...allValues,
                  // title: widgets.current[w].title,
                  name: props.cell.value,
                  newName: props.cell.value,
                  id: props.row.values.id,
                  type: props.row.values.appType,
                  newType: props.row.values.appType,
                  version: props.row.values.version.toString(),
                  newVersion: props.row.values.version.toString()
                });
              }

              setSaved(false)
              setSavedBuild(false)
              setSavedResources(false)
              console.log("test - ", props.row.values.version.toString())
              let x = []
              props.row.values.dataSource.map(dataSource => {
                if (dataSource.__typename==="Api")
                x.push({"text": dataSource.url, "isAdded":dataSource.added, "id": dataSource.id, "details": dataSource.desc})
              })
              //Deepcloning
              let clonedArray = JSON.parse(JSON.stringify(x))
              clonedArray = x.map(a => {return {...a}})


              
              if (x.length===0){

                setApiData({
                  data: [],
                  history: []
                })
              } else {
                setApiData({
                  data: x,
                  history: clonedArray
                })
                
              }
            }}
          >
            {props.cell.value}
          </Text>
        );
      },
    },
    {
      Header: "App ID",
      // accessor: "appId",
      accessor: "id",
      Cell: props => {
        return <Text>{props.cell.value}</Text>;
      },
    },
    {
      Header: "Type",
      accessor: "appType",
      /*className: "appType",*/
      // Cell: cellProp => appTypes[cellProp.row.values.appType],
    },

    {
      Header: "Title",
      accessor: "title",
    },
    {
      Header: "Status",
      accessor: "appStatus",
      /*className: "status",*/
      // Cell: cellProp => versionStatus[cellProp.row.values.status],
    },
    {
      Header: "Version",
      accessor: "version",
      /*className: "version",*/
    },
    {
      Header: "Modified",
      accessor: "updatedAt",
      className: "date",
      Cell: props => {
        return <Text>{moment(props.cell.value).toDate().toUTCString()}</Text>;
      },
    },
    {
      Header: "dataSource",
      accessor: "dataSource"
    },
    
    // {
    //   Header: "ID",
    //   accessor: "id",
    // },
    {
      Header: () => null, // No header
      id: "sendApp", // It needs an ID
      Cell: cellProp => {
        return (
          <Button
            size="xs"
            onClick={e => {
              console.log(cellProp.row.values);
              sendClick(cellProp.row.values);
            }}
          >
            {i18n.__("submit")}
          </Button>
          // <form onSubmit={handleSubmit}>
          // <input type="file" onChange={handleChange}/>
          // <button type="submit">Upload</button>
          // </form>
        );
      },
    },
  ];

  const [upload, setUpload] = useState(false);
  const selectedRow = useRef({});

  const sendClick = row => {
    selectedRow.current = row;
    setUpload(true);
  };

  const closeClick = (fileUploaded = false, version) => {
    if (fileUploaded) {
      // addAppVersionMutation(GRAPHQL, {
      //   id: selectedRow.current.id,
      //   nextVersion: version,
      //   status: 1, //received
      // }).then(res => {
      setUpload(false);
      // });
    } else {
      setUpload(false);
    }
  };

  const [activeTab, setActiveTab] = useState(0);

  const tabClick = (e, tab) => {
    console.log("Click", e);
    console.log("TAB", tab);
    setActiveTab(tab);
  };

  const [activeTab2, setActiveTab2] = useState(0);

  const tabClick2 = (e, tab) => {
    console.log("Click", e);
    console.log("TAB", tab);
    setActiveTab2(tab);
  };

  const [activeTab3, setActiveTab3] = useState(0);

  const tabClick3 = (e, tab) => {
    console.log("Click", e);
    console.log("TAB", tab);
    setActiveTab3(tab);
  };

  const [dataSource, setDataSource] = useState([]);
  
  
  const [apiData, setApiData] = useState({
      data: [],
      history: []
  });

  console.log("CLOUD DATA", dataSource);
  console.log("API DATA", apiData);

const experiment = []
for (var i=0; i<50; i++){
  experiment[i] = i
}

  let addedDataSources = dataSource
    .concat(apiData.data)
    .filter(key => key.isAdded === true);
  console.log("ADDED DATA", addedDataSources);
  const [searchApps, setSearchApps] = useState("");

  let shownApps = data
    .filter(app => app.title.toLowerCase().includes(searchApps.toLowerCase()));
  console.log("ADDED APPS", shownApps);

  const [addedDataSources2, setAddedDataSources2] = useState([]);

  
  const [editControled, setEditControled] = useState(false);

  ///Prifina user cloud

  const addDataSource = (text, func, url) => {
    const newSourceData = [...dataSource, { text, func, url }];
    setDataSource(newSourceData);
  };

  const removeDataSource = index => {
    const newSourceData = [...dataSource];
    newSourceData.splice(index, 1);
    setDataSource(newSourceData);
  };

  const completeDataSource = index => {
    const newSourceData = [...dataSource];
    newSourceData[index].isAdded = true;
    setDataSource(newSourceData);
  };

  //////API

  const addApiSource = text => {
    const newSourceData = [...apiData.data, { text, "isAdded": false }];
    setApiData({
      data: newSourceData,
      history: [...apiData.history]
    });
  };

  const removeApiSource = index => {
    const newSourceData = [...apiData.data];
    newSourceData.splice(index, 1);
    setApiData({
      data: newSourceData,
      history: [...apiData.history]
    });
  };

  const completeApiSource = index => {
    const newSourceData = [...apiData.data];
    newSourceData[index].isAdded = true;
    console.log(newSourceData)
    setApiData({
      data: newSourceData,
      history: [...apiData.history]
    });
    console.log(apiData)
  };

  ////common data sources

  const uncompleteDataSource = index => {
    const newSourceData = [...apiData.data];
    newSourceData[index].isAdded = false;
    setAddedDataSources2(newSourceData);
  };

  const addDataSourceDetails = (index,text) => {
    const newSourceData = [...apiData.data];
    newSourceData[index].details = text;
    // console.log("Test")
  
    setApiData({
      data: newSourceData,
      history: [...apiData.history]
    });

    // submitAPISources(index);
    // console.log(newSourceData)
    // console.log("3")

  };

  const [step, setStep] = useState(0);

  switch (step) {
    case 0:
      break;
    case 1:
      break;
    case 2:
      break;
    case 3:
      break;
    case 4:
      break;
    case 5:
      break;
    default:
  }

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);

  console.log("projectdialog", projectDialogOpen);

  const onDialogClose = e => {
    setProjectDialogOpen(false);
    e.preventDefault();
  };

  const onDialogClick = async e => {
    ///...further logic on adding data source data
    setProjectDialogOpen(false);

    e.preventDefault();
  };

  const items = [
    {
      id: 0,
      label: i18n.__("market"),
      icon: viewDashboard,
      onClick: () => {
        setStep(0);
      },
    },
    {
      id: 1,
      label: i18n.__("apps"),
      icon: mdiWidget,
      onClick: () => {
        setStep(2);
      },
    },
    {
      id: 2,
      label: i18n.__("widgets"),
      icon: mdiBookOpenVariant,
      onClick: () => {
        setStep(3);
      },
    },
  ];

  useEffect(() => {
        fetchApps();
  }, [step]);




  const searchData = event => {
    setSearchApps(event.target.value)
  }

  const pickApp = app => {
    var title = app.title
                    var description
                    var icon 
                    var screenshots 
                    var developer
                    var category
                    var languages
                    var ageRating
                    var compatibility
                    if (app.description!==null){
                        description = app.description.html

                    } else {
                      icon = ""
                    }
                    if (app.icon!==null){
                      icon = app.icon.url

                  } else {
                    icon = ""
                  }
                  if (app.screenshots!==null){
                    screenshots = app.screenshots

                } else {
                  screenshots = []
                }
                if (app.developer!==null){
                  developer = app.developer

              } else {
                developer = ""
              }
              if (app.category!==null){
                category = app.category

            } else {
              category = ""
            }
            if (app.languages!==null){
              languages = app.languages

          } else {
            languages = ""
          }
          if (app.ageRating!==null){
            ageRating = app.ageRating

        } else {
          ageRating = ""
                    }
                    if (app.compatibility!==null){
                      compatibility = app.compatibility

                  } else {
                    compatibility = []
                  }
                  setAllValues({
                    ...allValues,
                    title: title,
                    description: description,
                    icon: icon,
                    screenshots: screenshots,
                    developer: developer,
                    category: category,
                    languages: languages,
                    ageRating: ageRating,
                    lastUpdated: app.updatedAt,
                    compatibility: compatibility

                  })

                    setStep(4)
  }


  return (
    <React.Fragment>
      <DevConsoleSidebar items={items} handleChange={searchData}/>
      <C.NavbarContainer bg="baseWhite">
        <DevConsoleLogo className="appStudio" />
      </C.NavbarContainer>
      <StyledBox>
        <Flex
          width="100vw"
          height="100vh"
          paddingLeft="286px"
          bg="white"
          flexDirection="column"
        >
          {step === 0 && (
            <>
              {projectDialogOpen && (
                <CreateProjectModal
                  onClose={onDialogClose}
                  onButtonClick={onDialogClick}
                  isOpen={projectDialogOpen}
                />
              )}
              <Flex  paddingLeft="44px" flexDirection="column">
                <Text paddingTop="48px">{i18n.__("profileApps")}</Text>
              <Flex paddingLeft="44px" flexDirection="row">
                {shownApps.filter(item=>item.appType=="App").map(test=>(
                  <>
                  <Flex
                  bg="baseMuted"
                  flexDirection="row"
                  borderRadius="10px"
                  padding="16px"
                >
                  <Flex display="flex" flexDirection="column">
                  {test.screenshots.length!==0 ? (
                         <Image src={test.screenshots[0].url} shape={"rounded"} width={100}/>
                        // console.log("Test")
                ):(<></>)}
                  
                  <Flex display="flex" flexDirection="row" justifyContent="center">
                  <Box>
                    {test.icon!==null ? (
                         <Image src={test.icon.url} shape={"rounded"} width={100}/>
                ):(<></>)}
                 
                  <Text fontSize="md" as="b" onClick={()=>{
                    console.log(test)
                    pickApp(test)
                  }}>{test.title}</Text>
                  <Text> </Text>
                  <Flex>
                  <Text fontSize="sm">{test.tagline}</Text>
                  </Flex>
                  </Box>
                  <Box>
                    <Button>{i18n.__("install")}</Button>
                  </Box>
                  </Flex>
                  </Flex>

                  
                  
                  
                </Flex>
                  </>
                ))}
              </Flex>
              <Text paddingTop="48px">{i18n.__("widgets")}</Text>
              <Flex  paddingLeft="44px" flexDirection="row">
                {shownApps.filter(item=>item.appType=="Widget").map(test=>(
                  <>
                  <Flex
                  bg="baseMuted"
                  flexDirection="row"
                  borderRadius="10px"
                  padding="16px"
                >
                  <Flex display="flex" flexDirection="row" justifyContent="center">
                  <Box>
                    {test.icon!==null ? (
                         <Image src={test.icon.url} shape={"rounded"} width={100}/>
                ):(<></>)}
                 
                  <Text fontSize="md" as="b" onClick={()=>{
                    pickApp(test)
                  }}>{test.title}</Text>
                  <Text> </Text>
                  <Flex>
                  <Text fontSize="sm">{test.tagline}</Text>
                  </Flex>
                  </Box>
                  <Box>
                    <Button>{i18n.__("install")}</Button>
                  </Box>
                  </Flex>

                  
                  
                  
                </Flex>
                  </>
                ))}
                
                </Flex>
              </Flex>
            </>
          )}
          {/* PROJECTS */}
          {step === 2 && (
            <>
              {projectDialogOpen && (
                <CreateProjectModal
                  onClose={onDialogClose}
                  onButtonClick={onDialogClick}
                  // isOpen={projectDialogOpen}
                />
              )}
                <Flex  paddingLeft="44px" flexDirection="column">
                <Text paddingTop="48px">{i18n.__("profileApps")}</Text>
                <Flex paddingLeft="44px" flexDirection="row">
                {shownApps.filter(item=>item.appType=="App").map(test=>(
                  <>
                  <Flex
                  bg="baseMuted"
                  flexDirection="row"
                  borderRadius="10px"
                  padding="16px"
                >
                  <Flex display="flex" flexDirection="column">
                  {test.screenshots.length!==0 ? (
                         <Image src={test.screenshots[0].url} shape={"rounded"} width={100}/>
                        // console.log("Test")
                ):(<></>)}
                  
                  <Flex display="flex" flexDirection="row" justifyContent="center">
                  <Box>
                    {test.icon!==null ? (
                         <Image src={test.icon.url} shape={"rounded"} width={100}/>
                ):(<></>)}
                 
                  <Text fontSize="md" as="b" onClick={()=>{

                  pickApp(test)
                  }}>{test.title}</Text>
                  <Text> </Text>
                  <Flex>
                  <Text fontSize="sm">{test.tagline}</Text>
                  </Flex>
                  </Box>
                  <Box>
                    <Button>{i18n.__("install")}</Button>
                  </Box>
                  </Flex>
                  </Flex>

                  
                  
                  
                </Flex>
                  </>
                ))}
                
              </Flex>
              </Flex>
            </>
          )}
          {step === 3 && (
            <>
            {projectDialogOpen && (
              <CreateProjectModal
                onClose={onDialogClose}
                onButtonClick={onDialogClick}
                // isOpen={projectDialogOpen}
              />
            )}
            <Flex  paddingLeft="44px" flexDirection="column">
                <Text paddingTop="48px">{i18n.__("widgets")}</Text>
                <Flex paddingLeft="44px" flexDirection="row">
              {shownApps.filter(item=>item.appType=="Widget").map(test=>(
               <>
               <Flex
               bg="baseMuted"
               flexDirection="row"
               borderRadius="10px"
               padding="16px"
             >
               <Flex display="flex" flexDirection="row" justifyContent="center">
               <Box>
                 {test.icon!==null ? (
                      <Image src={test.icon.url} shape={"rounded"} width={100}/>
             ):(<></>)}
             
              
               <Text fontSize="md" as="b" onClick={()=>{
                 pickApp(test)
               }}>{test.title}</Text>
               <Text> </Text>
               <Flex>
               <Text fontSize="sm">{test.tagline}</Text>
               </Flex>
               </Box>
               <Box>
                 <Button>{i18n.__("install")}</Button>
               </Box>
               </Flex>

               
               
               
             </Flex>
               </>
              ))}
              
            </Flex>
            </Flex>
          </>
          )}
          {step === 4 && (
            <>
            <Flex paddingTop="48px" paddingLeft="44px" flexDirection="row">
              <Box>
              <Flex alignItems="center" mr="20px">
                    <BlendIcon
                      iconify={mdiArrowLeft}
                      width="24px"
                      onClick={() => {
                        setStep(0);
                      }}
                    />
                    <Text ml="16px">Browse Apps</Text>
              </Flex>
              
              <Flex paddingTop ="16px"  >
                <Flex
                  bg="baseMuted"
                  flexDirection="column"
                  borderRadius="10px"
                  padding="16px"
                  marginRight="16px"
                  width="100%"
                >
                  
                  <Flex display="flex" flexDirection="row" justifyContent="space-between">
                  <Box>
                  <Flex display="flex" flexDirection="row" justifyContent="space-between">
                  <Box>
                  <Image src={allValues.icon} shape={"rounded"} width={100}/>
                  </Box>
                  <Box>
                  <Flex display="flex" flexDirection="column" justifyContent="space-between">
                  <Text fontSize="lg" as="b">{allValues.title}</Text>
                  <Text fontSize="lg" >{allValues.developer} • {allValues.category}
                  </Text>
                  </Flex>

                  </Box>
                  </Flex>
                  </Box>

                  <Box>
                  
                    <Button>{i18n.__("install")}</Button>
                    <Button>{i18n.__("reportBug")}</Button>
                    <Button>{i18n.__("support")}</Button>
                  </Box>
                  </Flex>
                </Flex>
                </Flex>
                <Flex paddingTop ="16px" justifyContent="left">
                <Flex
                  bg="baseMuted"
                  flexDirection="column"
                  borderRadius="10px"
                  padding="16px"
                >
                   <Flex display="flex" flexDirection="row" >
                  {allValues.screenshots.map(screenshot => (
                    <Flex paddingRight="16px" >
                      <Image src={screenshot.url} shape={"rounded"} width={500}/>
                    </Flex>
                    
                  ))}
                  </Flex>

                  
                  
                </Flex>
                </Flex>
                
                
                <Flex paddingTop ="16px" justifyContent="left">
                <Flex
                  bg="baseMuted"
                  flexDirection="column"
                  borderRadius="10px"
                  padding="16px"
                  width="100%"
                >
                  <Flex display="flex" flexDirection="column" justifyContent="left">
                  <Text fontSize="lg" as="b">{i18n.__("description")}</Text>
                  <br />

                  <div dangerouslySetInnerHTML={{ __html: allValues.description }} />

                  </Flex>

                  
                  
                  
                </Flex>
                </Flex>

               
              </Box>
              <Box>
                <Flex padding="20px">
                <Flex
                  bg="baseMuted"
                  flexDirection="column"
                  borderRadius="10px"
                  padding="16px"
                  width="100%"
                >
                  <Flex display="flex" flexDirection="column" justifyContent="left">
                  <Text fontSize="lg" as="b">{i18n.__("information")}</Text>
                  <br />
                  <Flex flexDirection="row" justifyContent="space-between" paddingTop="16px">
                  <Text>Developer</Text>
                  <Text>{allValues.developer}</Text>
                  </Flex>
                  <Flex flexDirection="row" justifyContent="space-between" paddingTop="16px">
                  <Text>Last Updated</Text>
                  <Text>{moment(allValues.lastUpdated).format('DD/MM/YYYY').toString()}</Text>
                  </Flex>
                  <Flex flexDirection="row" justifyContent="space-between" paddingTop="16px">
                  <Text>Category</Text>
                  <Text>{allValues.category}</Text>
                  </Flex>
                  <Flex flexDirection="row" justifyContent="space-between" paddingTop="16px">
                  <Text>Approximate Size</Text>
                  <Text>TBD</Text>
                  </Flex>
                  <Flex flexDirection="row" justifyContent="space-between" paddingTop="16px">
                  <Text>Languages Support</Text>
                  <Text>{allValues.languages}</Text>
                  </Flex>
                  <Flex flexDirection="row" justifyContent="space-between" paddingTop="16px">
                  <Text>Age</Text>
                  <Text>{allValues.ageRating}</Text>
                  </Flex>
                  <Flex flexDirection="row" justifyContent="space-between" paddingTop="16px">
                  <Text>Compatibility</Text>
                  <Text>{allValues.compatibility.toString()}</Text>
                  </Flex>
                  </Flex>
                  </Flex>
                </Flex>
              
              </Box>
            

                  
                  
                  
                
                </Flex>
            </>
          )}
        </Flex>
      </StyledBox>
    </React.Fragment>
  );
};

Main.propTypes = {
  data: PropTypes.instanceOf(Array),
  currentUser: PropTypes.instanceOf(Object),
  cell: PropTypes.instanceOf(Array),
  row: PropTypes.instanceOf(Array),
};

const Home = props => {
    const history = useHistory();
  //   const {
  //     userAuth,
  //     currentUser,
  //     isAuthenticated,
  //     mobileApp,
  //     APIConfig,
  //     AUTHConfig,
  //   } = useAppContext();

  //   console.log("HOME ", currentUser);

  //   const [initClient, setInitClient] = useState(false);

  //   const isMountedRef = useIsMountedRef();
  //   const apps = useRef([]);
  //   const componentProps = useRef({});
  //   const activeUser = useRef({});
  //   const notificationCount = useRef(0);
  //   let AppComponent = Main;

  //   const xcreateClient = (endpoint, region) => {
  //     Auth.currentCredentials().then(c => {
  //       console.log("DEV USER CLIENT ", c);
  //     });
  //     const client = new AWSAppSyncClient({
  //       url: endpoint,
  //       region: region,
  //       auth: {
  //         type: AUTH_TYPE.AWS_IAM,
  //         credentials: () => Auth.currentCredentials(),
  //       },

  //       disableOffline: true,
  //     });
  //     return client;
  //   };

  //   const updateNotification = useCallback(handler => {
  //     //notificationHandler.current = handler;
  //   }, []);

  //   useEffect(() => {
  //     async function fetchData() {
  //       if (isMountedRef.current) {
  //         const currentPrifinaUser = await getPrifinaUserQuery(
  //           GRAPHQL,
  //           currentUser.prifinaID,
  //         );
  //         console.log("CURRENT USER ", currentPrifinaUser);
  //         let appProfile = JSON.parse(
  //           currentPrifinaUser.data.getPrifinaUser.appProfile,
  //         );
  //         console.log("CURRENT USER ", appProfile, appProfile.initials);

  //         let clientEndpoint = "";
  //         let clientRegion = "";

  //         if (!appProfile.hasOwnProperty("endpoint")) {
  //           const defaultProfileUpdate = await updateUserProfileMutation(
  //             GRAPHQL,
  //             currentUser.prifinaID,
  //           );
  //           console.log("PROFILE UPDATE ", defaultProfileUpdate);
  //           appProfile = JSON.parse(
  //             defaultProfileUpdate.data.updateUserProfile.appProfile,
  //           );
  //         }
  //         clientEndpoint = appProfile.endpoint;
  //         clientRegion = appProfile.region;

  //         //const client = createClient(clientEndpoint, clientRegion);
  //         const _currentSession = await Auth.currentSession();
  //         const client = await createClient(
  //           clientEndpoint,
  //           clientRegion,
  //           _currentSession,
  //         );

  //         activeUser.current = {
  //           name: appProfile.name,
  //           uuid: currentUser.prifinaID,
  //           endpoint: clientEndpoint,
  //           region: clientRegion,
  //           dataConnectors: currentPrifinaUser.data.getPrifinaUser.dataSources
  //             ? JSON.parse(currentPrifinaUser.data.getPrifinaUser.dataSources)
  //             : {},
  //         };

  //         const prifinaApps = await listAppsQuery(GRAPHQL, {
  //           filter: { prifinaId: { eq: currentUser.prifinaID } },
  //         });
  //         console.log("APPS ", prifinaApps.data);
  //         apps.current = prifinaApps.data.listApps.items;

  //         console.log("APPS ", prifinaApps.data);
  //         componentProps.current = {
  //           data: apps.current,
  //           currentUser: currentUser,
  //         };

  //         //console.log("CURRENT SETTINGS 2", client);
  //         componentProps.current.GraphQLClient = GRAPHQL;
  //         componentProps.current.appSyncClient = client;
  //         componentProps.current.prifinaID = currentUser.prifinaID;
  //         componentProps.current.initials = appProfile.initials;
  //         componentProps.current.updateNotificationHandler = updateNotification;
  //         componentProps.current.activeUser = activeUser.current;

  //         console.log("COMPONENT ", componentProps);
  //         setInitClient(true);
  //       }
  //       return null;
  //     }

  //     fetchData();
  //   }, [isMountedRef.current]);

  return (
    <>
      {/* {initClient && (
        <Content Component={AppComponent} {...componentProps.current} />
      )}
      {!initClient && (
        <div>Home {isAuthenticated ? "Authenticated" : "Unauthenticated"} </div>
      )} */}
      <ToastContextProvider>
        <Main />
      </ToastContextProvider>
    </>
  );
};

Home.displayName = "Home";

export default Home;
// export default withUsermenu()(Home);
