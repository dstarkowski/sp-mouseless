declare var self : any;
import * as React from 'react';
import * as ReactDOM from 'react-dom';

var data = [
	"home page",
	"permission levels",
	"root site",
	"root web",
	"settings",
	"site contents",
	"site features",
	"site settings",
	"web columns",
	"web content types",
	"web features",
	"web groups",
	"web permissions",
	"web users"
];

interface ISuggestion { _name: string }
interface SearchBoxProps { suggestions: ISuggestion[]; }
interface SuggestionListProps { suggestions: ISuggestion[]; }
interface SuggestionItemProps { data: ISuggestion; }

class SearchBox extends React.Component<{}, SearchBoxProps> {
	constructor(props : SearchBoxProps, context? : any) {
		super(props, context)
		
		self.port.on('show', () => this.onShow());
		self.port.on('suggestions-ready', (args: ISuggestion[]) => this.onSuggestionsReady(args));
	}
	
	private onShow() {
		let input = ReactDOM.findDOMNode(this.refs['input']) as HTMLInputElement;
		input.focus();
		input.select();
	}
	
	private onSuggestionsReady(args: ISuggestion[]) {
		this.setState({suggestions : args});
	}
	
	getInitialState() {
		let suggestions : ISuggestion[] = [];  
		return { suggestions: suggestions };
	}

	componentDidMount() {
		self.port.emit('text-changed', '');
	}
	
	onKeyUp(event : KeyboardEvent) {
		let input = event.target as HTMLInputElement;
		let text = input.value;

		if (event.keyCode == 13) {
			self.port.emit('text-entered', text);
			self.port.emit('text-changed', '');
			input.value = '';
		}
		else {
			self.port.emit('text-changed', text);
		}
	}

	render() {
		if (this.state == null) {
			return (
				<div>
					<input id="spm-input" ref="input" onKeyUp={this.onKeyUp} />
				</div>
			);
		}
		return (
			<div>
				<input id="spm-input" ref="input" onKeyUp={this.onKeyUp} />
				<SuggestionList suggestions={this.state.suggestions} />
			</div>
		);
	}
}

class SuggestionItem extends React.Component<SuggestionItemProps, {}> {
	render () {
		return (
			<li>{this.props.data._name}</li>
		);
	}
}

class SuggestionList extends React.Component<SuggestionListProps, {}> {
	render () {
		var suggestionItems = this.props.suggestions.map(function(item) {
			return (
				<SuggestionItem data={item} />
			);
		});
		return (
			<ul>
				{suggestionItems}
			</ul>
		);
	}
}

ReactDOM.render(
	<SearchBox />,
	document.getElementById('spm-root')
);