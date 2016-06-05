declare var self : FFSelf;
import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface CommandsConfigurationProps { commands: string; }

class CommandsConfiguration extends React.Component<CommandsConfigurationProps, {}> {
	constructor(props : CommandsConfigurationProps, context? : any) {
		super(props, context)
	}
	
	save() {
		let input = ReactDOM.findDOMNode(this.refs['textarea']) as HTMLTextAreaElement;
		self.port.emit('save', input.value);
	}
	
	render() {
		return (
			<div>
				<div>
					<input type="button" value="Save" onClick={() => this.save()} />
				</div>
				<div>
					<textarea id="commands-config" ref='textarea' style={{width: '100%', height: '100%'}} defaultValue={this.props.commands}/>
				</div>
			</div>
		);
	}
}

ReactDOM.render(
	<CommandsConfiguration commands={self.options.commands} />,
	document.getElementById('commands-config')
);