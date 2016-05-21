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

interface ISuggestion { _name: string, _scope: string, _url: string, _selected: boolean }
interface SearchBoxProps { suggestions: ISuggestion[]; modifier: string }
interface SuggestionListProps { suggestions: ISuggestion[]; }
interface SuggestionItemProps { data: ISuggestion; }

class SearchBox extends React.Component<{}, SearchBoxProps> {
	constructor(props : SearchBoxProps, context? : any) {
		super(props, context)
		
		self.port.on('show', () => this.onShow());
		self.port.on('suggestions-ready', (args: ISuggestion[]) => this.onSuggestionsReady(args));
		self.port.on('modifier-ready', (modifier: string) => this.onModifierReady(modifier));
		
		this._suggestions = [];
		this._suggestionPosition = -1;
		this._modifier = '';
	}
	
	private _suggestions : ISuggestion[];
	private _suggestionPosition : number;
	private _modifier: string;
	
	private onShow() {
		let input = ReactDOM.findDOMNode(this.refs['input']) as HTMLInputElement;
		input.focus();
		input.select();
	}
	
	private onModifierReady(modifier: string) {
		this._modifier = modifier;
		
		this.setState({suggestions: this._suggestions, modifier: this._modifier});
	}
	
	private onSuggestionsReady(args: ISuggestion[]) {
		this._suggestions = args;
		this._suggestionPosition = -1;

		if (args.length > 0) {
			this._suggestionPosition = 0;
		}
		
		this.markSelectedSuggestion();

		this.setState({suggestions: args, modifier: this._modifier});
	}
	
	markSelectedSuggestion() {
		for (let suggestion of this._suggestions) {
			suggestion._selected = false;
		}
		
		this._suggestions[this._suggestionPosition]._selected = true;
	}
	
	getInitialState() {
		let suggestions : ISuggestion[] = [];  
		return { suggestions: suggestions, modifier: this._modifier };
	}

	componentDidMount() {
		self.port.emit('text-changed', '');
	}
	
	onKey(event : KeyboardEvent) {
		switch (event.keyCode) {
			case 13:
				this.onKeyEnter(event);
				break;
			case 38:
				this.onNavigate(event, -1);
				break;
			case 40:
				this.onNavigate(event, +1);
				break;
			default:
				this.onKeyOther(event);
				break;
		}
	}
	
	onKeyEnter(event : KeyboardEvent) {
		var command = this._suggestions[this._suggestionPosition];

		self.port.emit('text-entered', command._name);
		self.port.emit('text-changed', '');

		let input = event.target as HTMLInputElement;
		input.value = '';
	}
	
	onNavigate(event : KeyboardEvent, direction : number) {
		if (this._suggestions.length > 0) {
			let position = this._suggestionPosition + direction;
			position = Math.max(position, 0);
			position = Math.min(position, this._suggestions.length - 1)
			
			this._suggestionPosition = position;
			this.markSelectedSuggestion();
			this.setState({ suggestions: this._suggestions, modifier: this._modifier });
		}

		event.defaultPrevented = true;
	}
	
	onKeyOther(event : KeyboardEvent) {
		let input = event.target as HTMLInputElement;
		let text = input.value;

		self.port.emit('text-changed', text);
	}

	render() {
		if (this.state == null) {
			return (
				<div>
					<input id='spm-input' ref='input' onKeyUp={(e : KeyboardEvent) => this.onKey(e)} />
				</div>
			);
		}
		return (
			<div>
				<input id='spm-input' ref='input' onKeyUp={(e : KeyboardEvent) => this.onKey(e)} />
				<div className='suggestion-modifier'>{this.state.modifier}</div>
				<SuggestionList suggestions={this.state.suggestions} />
			</div>
		);
	}
}

class SuggestionItem extends React.Component<SuggestionItemProps, {}> {
	render () {
		return (
			<li className={this.props.data._selected ? 'suggestion-item selected' : 'suggestion-item'}>
				<span className='suggestion-name'>{this.props.data._name}</span>
				<span className='suggestion-url'>({this.props.data._scope}){this.props.data._url}</span>
			</li>
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
			<ul className='suggestion-list'>
				{suggestionItems}
			</ul>
		);
	}
}

ReactDOM.render(
	<SearchBox />,
	document.getElementById('spm-root')
);