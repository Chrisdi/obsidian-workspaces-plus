import { FuzzySuggestModal, WorkspacePluginInstance } from "obsidian";
import WorkspacesPlus from "./main";

export class SendToWorkspaceModal extends FuzzySuggestModal<string> {
  plugin: WorkspacesPlus;
  workspacePlugin: WorkspacePluginInstance;
  filePath: string;

  constructor(plugin: WorkspacesPlus, filePath: string) {
    super(plugin.app);
    this.plugin = plugin;
    this.filePath = filePath;
    this.workspacePlugin = plugin.utils.workspacePlugin;
    this.setPlaceholder("Send to workspace...");
    this.setInstructions([
      { command: "↵", purpose: "send" },
      { command: "esc", purpose: "cancel" },
    ]);
  }

  getItems(): string[] {
    const current = this.workspacePlugin.activeWorkspace;
    return Object.keys(this.workspacePlugin.workspaces)
      .filter(name => !name.match(/^mode:/i) && name !== current)
      .sort();
  }

  getItemText(item: string): string {
    return item;
  }

  onChooseItem(item: string): void {
    this.plugin.sendNoteToWorkspace(item, this.filePath);
  }
}
