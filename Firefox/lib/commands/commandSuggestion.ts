export class CommandSuggestion {
	constructor(uuid: string, name: string, type: string, description: string) {
		this.uuid = uuid;
		this.name = name;
		this.type = type;
		this.description = description;
	}
	
	uuid: string;
	name: string;
	type: string;
	description: string;
}