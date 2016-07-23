/**
 * Configuration, specified in the package.json,
 * under the 'electrify' node
 */
export interface IPluginConfiguration {
    /**
     * Glob to match supported files
     */
    supportedFiles?: string[];

    /**
     * VIM assigned filetypes to match
     */
    supportedFileTypes?: string[];
}
