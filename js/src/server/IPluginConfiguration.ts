/**
 * Configuration, specified in the package.json,
 * under the 'electrify' node
 */
interface IPluginConfiguration {
    /**
     * Glob to match supported files
     */
    supportedFiles: string[];


    /**
     * VIM assigned filetypes to match
     */
    supportedFileTypes: string[];
}

export = IPluginConfiguration;
