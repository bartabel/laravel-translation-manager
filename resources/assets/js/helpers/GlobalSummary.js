import GlobalSetting from './GlobalSetting';
import axios from "axios";
import appSettings, { appSettings_$ } from "./AppSettings";
import { apiURL, GET_SUMMARY_DATA } from "./ApiRoutes";

export class GlobalSummary extends GlobalSetting {
    constructor() {
        super("globalSummary", {
            // default settings
            connectionName: "default",
            displayLocales: null,
            summary: [],
        }, {
            // false means throttled, true - immediate update, commented or null - no server update
            // data: [],
        });

        this.connectionName = this.defaultSettings.connectionName;
        this.displayLocales = this.defaultSettings.displayLocales;

        this.unsubscribe = appSettings.subscribeLoaded(() => {
            if (appSettings_$.displayLocales[0]()) {
                if (this.displayLocales === null) {
                    // first load
                    this.load();
                } else {
                    if (!this.displayLocales ||
                        this.connectionName !== appSettings_$.connectionName() ||
                        this.displayLocales.join(',') !== appSettings_$.displayLocales.$_ifArray(Array.prototype.join, ',')) {
                        this.staleData(appSettings_$.uiSettings.autoUpdateViews());
                    }
                }
            }
        });

        this.load();
    }

    // implement to test if can request settings from server
    serverCanLoad() {
        return appSettings_$.displayLocales[0]();
    }

    // implement to request settings from server
    serverLoad() {
        axios.get(apiURL(GET_SUMMARY_DATA))
            .then((result) => {
                this.displayLocales = result.data.displayLocales;
                this.connectionName = result.data.connectionName;
                this.processServerUpdate(result.data);
            });
    }

    // implement to send server request
    updateServer(settings, frameId) {
        throw "globalSummary has no update";
    }
}

const globalSummary = new GlobalSummary();
export const globalSummary_$ = globalSummary.getBoxed();

export default globalSummary;
