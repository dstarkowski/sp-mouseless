declare var self : any;
import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface ISuggestion { name: string, type: string, description: string, selected: boolean }
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
			suggestion.selected = false;
		}
		
		this._suggestions[this._suggestionPosition].selected = true;
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

		self.port.emit('text-entered', command.name);
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
			<li className={this.props.data.selected ? 'suggestion-item selected' : 'suggestion-item'}>
				<span className='suggestion-name'>{this.props.data.name}</span>
				<span className='suggestion-url'>{this.props.data.type}: {this.props.data.description}</span>
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