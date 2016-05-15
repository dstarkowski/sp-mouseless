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

interface SearchBoxProps { data: string[]; }

class SearchBox extends React.Component<SearchBoxProps, {}> {
	constructor(props : SearchBoxProps, context? : any) {
		super(props, context)
		
		self.port.on('show', () => {
			var input = ReactDOM.findDOMNode(this.refs['input']) as HTMLInputElement;
			input.focus();
			input.select();
		});
		
	}
	
	onKeyUp(event : KeyboardEvent) {
		if (event.keyCode == 13) {
			let input = event.target as HTMLInputElement;
			let text = input.value;
			self.port.emit('text-entered', text);
			input.value = '';
		}
	}

	render() {
		return (
			<div>
				<input id="spm-input" ref="input" onKeyUp={this.onKeyUp} />
				<SuggestionList data={this.props.data} />
			</div>
		);
	}
}

interface SuggestionItemProps { data: string; }

class SuggestionItem extends React.Component<SuggestionItemProps, {}> {
	render () {
		return (
			<li>{this.props.data}</li>
		);
	}
}

interface SuggestionListProps { data: string[]; }

class SuggestionList extends React.Component<SuggestionListProps, {}> {
	render () {
		var suggestionItems = this.props.data.map(function(item) {
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
	<SearchBox data={data} />,
	document.getElementById('spm-root')
);