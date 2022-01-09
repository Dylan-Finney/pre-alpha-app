/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/display-name */
/* eslint-disable react/no-multi-comp */

import React, { useRef, useState, useEffect } from "react";
import { PrifinaProvider, PrifinaContext } from "@prifina/hooks";

//import i18n from "../lib/i18n";

import Amplify, { Auth, API as GRAPHQL } from "aws-amplify";
/*
import {
  getPrifinaWidgetsQuery,
  getPrifinaUserQuery,
  updateUserProfileMutation,
  listAppMarketQuery,
  listDataSourcesQuery,
} from "../graphql/api";
*/

import {
  getPrifinaUserQuery,
  updateUserProfileMutation,
  listAppMarketQuery,
  listDataSourcesQuery,
  updateActivity,
  addNotification,
  //getNotificationCount,
  getAddressBook,
  i18n,
  useAppContext,
  useUserMenu,
  withUsermenu,
  getSystemNotificationCountQuery,
  createClient,
} from "@prifina-apps/utils";

/*
import {
  createNotification,
  updateActivity,
  addNotification,
} from "../graphql/mutations";
*/
/*
import { newNotification } from "../graphql/subscriptions";
*/
/*
import {
  listNotifications,
  getNotificationCount,
  getAddressBook,
} from "../graphql/queries";
*/
import gql from "graphql-tag";

import config from "../config";

//import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync";
import { useLocation, useHistory } from "react-router-dom";
/*
import {
  UserMenuContextProvider,
  useUserMenu,
} from "@blend-ui/floating-user-menu";
*/

//import withUsermenu from "./UserMenu";

//import UserMenuContextProvider, { useUserMenu } from "./FloatingUserMenu";
//import { useUserMenu } from "./FloatingUserMenu";

//import LogoutDialog from "./LogoutDialog";
//import { useAppContext } from "../lib/contextLib";

import PropTypes from "prop-types";
//import DisplayApp from "../pages/DisplayApp";

//const DisplayApp = React.lazy(() => import("../pages/DisplayApp"));

i18n.init();
/*
const APIConfig = {
  aws_appsync_graphqlEndpoint: config.appSync.aws_appsync_graphqlEndpoint,
  aws_appsync_region: config.main_region,
  aws_appsync_authenticationType: config.appSync.aws_appsync_authenticationType,
};

const AUTHConfig = {
  // To get the aws credentials, you need to configure
  // the Auth module with your Cognito Federated Identity Pool
  mandatorySignIn: false,
  userPoolId: config.cognito.USER_POOL_ID,
  identityPoolId: config.cognito.IDENTITY_POOL_ID,
  userPoolWebClientId: config.cognito.APP_CLIENT_ID,
  region: config.main_region,
};
*/
/*
const S3Config = {
  AWSS3: {
    bucket: config.S3.bucket, //REQUIRED -  Amazon S3 bucket name
    region: config.S3.region, //OPTIONAL -  Amazon service region
  },
};
*/

const appPaths = {
  "display-app": "DisplayApp",
  settings: "Settings",
  "app-market": "AppMarket",
  "dev-console": "DevConsole",
  "data-console": "DataConsole",
  "profile-cards": "ProfileCards",
  "smart-search": "SmartSearch",
};

const importApp = appName => {
  console.log("APP ", appName);
  return React.lazy(() =>
    import("../pages/" + appName).catch(() => import("./NotFoundPage")),
  );
};

const Content = ({
  Component,
  initials,
  notificationCount,
  /*clientHandler,*/
  appSyncClient,
  activeUser,
  ...props
}) => {
  const userMenu = useUserMenu();
  console.log(
    "USERMENU CORE APP INIT  ",
    { ...props },
    initials,
    notificationCount,
  );
  userMenu.setClientHandler(appSyncClient);
  userMenu.setActiveUser(activeUser);
  useEffect(() => {
    userMenu.show({
      initials: initials,
      effect: { hover: { width: 42 } },
      notifications: notificationCount,
      RecentApps: [],
      PrifinaGraphQLHandler: GRAPHQL,
      prifinaID: activeUser.uuid,
    });
    //userMenu.setPrifinaGraphQLHandler(GRAPHQL);
    //console.log(RecentApps);
  }, []);

  return <Component appSyncClient={appSyncClient} {...props} />;
};

Content.propTypes = {
  Component: PropTypes.elementType.isRequired,
  initials: PropTypes.string,
  notificationCount: PropTypes.number,
  appSyncClient: PropTypes.object,
  activeUser: PropTypes.object,
};
const CoreApps = props => {
  console.log("CORE COMPONENT --->", props, props.hasOwnProperty("app"));
  const history = useHistory();
  const { AUTHConfig, APIConfig, userAuth } = useAppContext();
  const { app } = props;
  let coreApp = "";
  if (app) {
    console.log("CORE APP ", app);
    coreApp = app;
  } else {
    const { pathname, search } = useLocation();
    coreApp = appPaths[pathname.split("/").pop()];
    console.log("NO PROPS CORE ", pathname, coreApp);
  }
  //console.log("CORE ", path.pop());
  //console.log("CORE ", pathname );
  //console.log("CORE ", search);
  const AppComponent = importApp(coreApp);
  const componentProps = useRef({});
  //const data = useRef([]);
  const activeUser = useRef({});
  const addressBook = useRef({});
  const lastActivity = useRef(new Date().getTime());
  const notificationCount = useRef(0);
  //const clientHandler = useRef(null);

  const [appReady, setAppReady] = useState(false);
  const [settingsReady, setSettingsReady] = useState(false);

  Auth.configure(AUTHConfig);
  Amplify.configure(APIConfig);
  //Amplify.configure(S3Config);
  console.log("AUTH CONFIG ", AUTHConfig);

  // const isMountedRef = useIsMountedRef();
  /*
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      console.log("INIT MOUNT ");
    } else {
      // Your useEffect code here to be run on update
      console.log("FIRST MOUNT ");
      console.log("APP READY ", appReady);
      console.log("APP READY PROPS ", componentProps);
      console.log("APP READY NAME ", coreApp);
    }
  });
*/
  const createClientx = (endpoint, region) => {
    Auth.currentCredentials().then(c => {
      console.log("CORE USER CLIENT ", c);
    });
    const client = new AWSAppSyncClient({
      url: endpoint,
      region: region,
      auth: {
        type: AUTH_TYPE.AWS_IAM,
        credentials: () => Auth.currentCredentials(),
      },

      disableOffline: true,
    });
    return client;
  };

  /*
  // get user auth...
  */
  useEffect(() => {
    async function fetchData() {
      try {
        const session = await Auth.currentSession();
        /*
      const user = await Auth.currentAuthenticatedUser();
      console.log("USER ", user);
      if (!user) {
        console.log("NO CURRENT USER FOUND");
      }
      */
        console.log("SESSION ", session);
        if (!session) {
          console.log("NO CURRENT SESSION FOUND");
        }
        console.log("PRIFINA-ID", session.idToken.payload["custom:prifina"]);
        const prifinaID = session.idToken.payload["custom:prifina"];

        const currentPrifinaUser = await getPrifinaUserQuery(
          GRAPHQL,
          prifinaID,
        );

        console.log("CURRENT USER ", currentPrifinaUser);
        let appProfile = JSON.parse(
          currentPrifinaUser.data.getPrifinaUser.appProfile,
        );
        console.log("CURRENT USER ", appProfile, appProfile.initials);

        // should get this from user ....
        /*
      const client = createClient(
        APIConfig.aws_appsync_graphqlEndpoint,
        APIConfig.aws_appsync_region,
      );
*/
        /*

      let clientEndpoint =
        "https://kxsr2w4zxbb5vi5p7nbeyfzuee.appsync-api.us-east-1.amazonaws.com/graphql";
      let clientRegion = "us-east-1";

      if (appProfile.hasOwnProperty("endpoint")) {
        clientEndpoint = appProfile.endpoint;
        clientRegion = appProfile.region;
      }
      */

        let clientEndpoint = "";
        let clientRegion = "";

        if (!appProfile.hasOwnProperty("endpoint")) {
          const defaultProfileUpdate = await updateUserProfileMutation(
            GRAPHQL,
            currentUser.prifinaID,
          );
          console.log("PROFILE UPDATE ", defaultProfileUpdate);
          appProfile = JSON.parse(
            defaultProfileUpdate.data.updateUserProfile.appProfile,
          );
        }
        clientEndpoint = appProfile.endpoint;
        clientRegion = appProfile.region;

        const _currentSession = await Auth.currentSession();
        const client = await createClient(
          clientEndpoint,
          clientRegion,
          _currentSession,
        );

        //const dataConnectors = [];

        activeUser.current = {
          name: appProfile.name,
          uuid: prifinaID,
          endpoint: clientEndpoint,
          region: clientRegion,
          dataSources: currentPrifinaUser.data.getPrifinaUser.dataSources
            ? JSON.parse(currentPrifinaUser.data.getPrifinaUser.dataSources)
            : {},
        };

        console.log("APP NAME ", coreApp);
        console.log("ACTIVE USER ", activeUser.current);
        // app component props
        if (coreApp === "DisplayApp") {
          const addressBookResult = await client.query({
            query: gql(getAddressBook),
            variables: {
              id: prifinaID,
            },
          });

          //console.log(addressBookResult);

          if (
            addressBookResult.data.getUserAddressBook.hasOwnProperty(
              "addressBook",
            ) &&
            addressBookResult.data.getUserAddressBook.addressBook !== null
          ) {
            JSON.parse(
              addressBookResult.data.getUserAddressBook.addressBook,
            ).forEach(user => {
              addressBook.current[user.uuid] = {
                name: user.name,
                endpoint: user.endpoint,
                region: user.region,
              };
            });
          }

          const prifinaWidgets = await listAppMarketQuery(GRAPHQL, {
            filter: { appType: { eq: 1 } },
          });

          const prifinaDataSources = await listDataSourcesQuery(GRAPHQL, {});
          console.log("DATA SOURCES ", prifinaDataSources);
          let dataSources = {};
          prifinaDataSources.data.listDataSources.items.forEach(item => {
            dataSources[item.source] = {
              modules: item.modules,
              sourceType: item.sourceType,
            };
          });
          /*
        const prifinaWidgets = await getPrifinaWidgetsQuery(GRAPHQL, "WIDGETS");
        console.log(
          "CURRENT CONFIG ",
          JSON.parse(prifinaWidgets.data.getPrifinaApp.widgets),
        );

        const widgetData = JSON.parse(
          prifinaWidgets.data.getPrifinaApp.widgets,
        );
          */
          let widgetData = {};
          prifinaWidgets.data.listAppMarket.items.forEach(item => {
            //console.log("APPMARKET ITEM ", item);
            const manifest = JSON.parse(item.manifest);
            console.log("APPMARKET MANIFEST ", manifest);
            widgetData[item.id] = {
              settings: item.settings,
              name: item.name,
              title: item.title,
              /*
            theme: manifest.theme || "dark",
            size: {
              height: manifest.size ? manifest.size.height : 300,
              width: manifest.size ? manifest.size.width : 300,
            },
            */
              shortDescription: manifest.shortDescription,
              version: item.version,
              image: manifest.screenshots[0],
              dataSources: item.dataSources || [],
            };
          });
          let data = [];
          if (
            currentPrifinaUser.data.getPrifinaUser.hasOwnProperty(
              "installedWidgets",
            ) &&
            currentPrifinaUser.data.getPrifinaUser.installedWidgets !== null
          ) {
            const installedWidgets = JSON.parse(
              currentPrifinaUser.data.getPrifinaUser.installedWidgets,
            );

            let widgetCounts = {};
            data = installedWidgets.map(w => {
              if (widgetCounts.hasOwnProperty(w.id)) {
                widgetCounts[w.id]++;
              } else {
                widgetCounts[w.id] = 0;
              }
              let defaultValues = {};
              if (widgetData[w.id].settings) {
                widgetData[w.id].settings.forEach(v => {
                  // if type=text...
                  if (v.field === "sizes") {
                    defaultValues["size"] = JSON.parse(v.value)[0].value;
                  } else {
                    defaultValues[v.field] = v.value;
                  }
                });

                if (w.hasOwnProperty("settings") && w.settings.length > 0) {
                  console.log("SETTINGS FOUND ", w);
                  w.settings.forEach(k => {
                    if (defaultValues.hasOwnProperty(k.field)) {
                      defaultValues[k.field] = k.value;
                    }
                  });
                }
              }
              //https://prifina-apps-352681697435.s3.amazonaws.com/fNBCsuKbikFG7VahRjRNaN/assets/back-plate.png
              //https://prifina-apps-352681697435.s3.amazonaws.com/fNBCsuKbikFG7VahRjRNaN/0.0.1/main.bundle.js

              const remoteUrl = [
                "https:/",
                process.env.REACT_APP_PRIFINA_APPS_BUCKET + ".s3.amazonaws.com",
                w.id,
                widgetData[w.id].version,
                "main.bundle.js",
              ].join("/");
              //console.log("WIDGET DATA ITEM ", widgetData[w.id]);
              return {
                url: remoteUrl,
                settings: widgetData[w.id].settings.length > 0,
                currentSettings: defaultValues,
                dataSources: widgetData[w.id].dataSources,
                widget: {
                  //size: widgetData[w.id].size,
                  //theme: widgetData[w.id].theme,
                  settings: widgetData[w.id].settings,
                  installCount: widgetCounts[w.id],
                  appID: w.id,
                  name: widgetData[w.id].name,
                  title: widgetData[w.id].title,
                  shortDescription: widgetData[w.id].shortDescription,
                  version: widgetData[w.id].version,
                  image: [
                    "https:/",
                    process.env.REACT_APP_PRIFINA_APPS_BUCKET +
                      ".s3.amazonaws.com",
                    w.id,
                    widgetData[w.id].image,
                  ].join("/"),
                },
              };
            });
          }
          console.log("ADDRESS BOOK ", addressBook.current);

          console.log("CURRENT SETTINGS 2", data, appProfile, client);
          componentProps.current.appSyncClient = client;
          componentProps.current.widgetConfigData = data;
          componentProps.current.prifinaID = prifinaID;
          componentProps.current.initials = appProfile.initials;
          componentProps.current.dataSources = dataSources;
        } else {
          // default componentProps...
          console.log("CURRENT SETTINGS 2", client);
          componentProps.current.GraphQLClient = GRAPHQL;
          componentProps.current.appSyncClient = client;
          componentProps.current.prifinaID = prifinaID;
          componentProps.current.initials = appProfile.initials;
        }

        // notificationCount...
        const notificationCountResult = await getSystemNotificationCountQuery(
          GRAPHQL,
          {
            filter: {
              owner: { eq: prifinaID },
              status: { eq: 0 },
            },
          },
        );
        /*
      const notificationCountResult = await client.query({
        query: gql(getNotificationCount),
        variables: {
          filter: {
            owner: { eq: prifinaID },
            status: { eq: 0 },
          },
        },
      });
      */
        console.log("COUNT ", notificationCountResult);
        notificationCount.current =
          notificationCountResult.data.getSystemNotificationCount;

        componentProps.current.notificationCount = notificationCount.current;

        lastActivity.current = new Date().getTime();
        await client.mutate({
          mutation: gql(updateActivity),
          variables: {
            id: prifinaID,
            activeApp: coreApp,
          },
        });

        setSettingsReady(true);
      } catch (e) {
        if (typeof e === "string" && e === "No current user") {
          //const user = await Auth.signIn("tahola", "xxxx");
          //console.log("AUTH ", user);
          //console.log("APP DEBUG ", appCode);
        }

        console.log("AUTH ", e);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (settingsReady) {
      console.log("SETTINGS ", activeUser, componentProps);
      setAppReady(true);
    }
  }, [settingsReady]);

  // possibly obsolete code...messaging demo may have used this
  const remoteUser = opts => {
    console.log("REMOTE USER ", opts);
    console.log("ADDRESS BOOK ", addressBook.current);
    const msg = opts.createMessage;
    const receiver = msg.receiver;

    const { endpoint, region } = addressBook.current[receiver];
    //const remoteClient = createClient(endpoint, region);
    const _remoteClient = createClient(endpoint, region);
    console.log(_remoteClient);
    return _remoteClient.mutate({
      mutation: gql(addNotification),
      variables: {
        input: {
          body: msg.body,
          owner: receiver,
          type: "MESSAGING",
          sender: msg.sender,
          app: coreApp,
        },
      },
    });
  };
  // possibly obsolete code...messaging demo may have used this
  const remoteClient = async (endpoint, region) => {
    const _currentSession = await Auth.currentSession();
    return createClient(endpoint, region, _currentSession);
  };

  console.log("ACTIVE USER ", activeUser.current, settingsReady);
  return (
    <>
      {appReady && coreApp === "DisplayApp" && (
        <PrifinaProvider
          stage={config.STAGE}
          Context={PrifinaContext}
          activeUser={activeUser.current}
          activeApp={coreApp}
          remoteUser={remoteUser}
          remoteClient={remoteClient}
        >
          <React.Suspense fallback={"Loading ..."}>
            <Content
              Component={AppComponent}
              {...componentProps.current}
              activeUser={activeUser.current}
            />
          </React.Suspense>
        </PrifinaProvider>
      )}

      {appReady && coreApp !== "DisplayApp" && (
        <React.Suspense fallback={"Loading ..."}>
          <Content
            Component={AppComponent}
            {...componentProps.current}
            activeUser={activeUser.current}
          />
        </React.Suspense>
      )}
      {!appReady && <div />}
    </>
  );
};

CoreApps.propTypes = {
  app: PropTypes.string,
};

export default withUsermenu()(CoreApps);
