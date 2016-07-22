import { IPluginHost } from "./IPluginHost";
export interface IPluginHostFactory {
    createPluginHost(): IPluginHost;
}
