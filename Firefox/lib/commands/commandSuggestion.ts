export class CommandSuggestion {
	constructor(name: string, type: string, description: string) {
		this.name = name;
		this.type = type;
		this.description = description;
	}
	
	name: string;
	type: string;
	description: string;
}