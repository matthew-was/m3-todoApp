
var ESCAPE_KEY = 27;
var ENTER_KEY = 13;

var Utils = {
	uuid: function () {
		/*jshint bitwise:false */
		var i, random;
		var uuid = '';

		for (i = 0; i < 32; i++) {
			random = Math.random() * 16 | 0;
			if (i === 8 || i === 12 || i === 16 || i === 20) {
				uuid += '-';
			}
			uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
				.toString(16);
		}

		return uuid;
	},

	extend: function () {
		var newObj = {};
		for (var i = 0; i < arguments.length; i++) {
			var obj = arguments[i];
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					newObj[key] = obj[key];
				}
			}
		}
		return newObj;
	}
};

var NewItemBox = React.createClass({
	getInitialState: function() {
		return {uuid: '', title: ''};
	},
	handleTextChange: function(e) {
    	this.setState({title: e.target.value});
  	},
	handleSubmit: function(e) {
		e.preventDefault();
		var title = this.state.title.trim();
		if (!title) {
			return;
		}
		var uuid = Utils.uuid();
		this.props.onItemSubmit({uuid: uuid, title: title, completed: false})
		this.setState({uuid: '', title: ''});
	},
	render: function() {
		return (
		    <form className="input-group" onSubmit={this.handleSubmit}>
        		<input
          			type="text" 
					className="form-control todoInput" 
					name="todoInput" 
					placeholder="Item..."
					value={this.state.title}
					onChange={this.handleTextChange}
        		/>
        		<span className="input-group-btn inputSubmit input-group-addon">
        			<input type="submit" value="Add" className="btn btn-default"/>
        		</span>
      		</form>		
		);
	}
});

var TodoItem = React.createClass({
	handleCheck: function(e) {
		this.props.onCheckChanged(e);
	},
	handleEdit: function(e, f) {
		var id = "#"+e;
		if (!f) {
			this.props.onEdit(id);
		};
	},
	handleClose: function(e) {
		this.props.onClose(e);
	},
	handleBlur: function(e) {
		var id = "#"+e;
		this.props.onBlur(id);
	},
	handleChange: function(e) {
		console.log(e);
	},
	handleKeyDown: function(e) {
		console.log(e);
	},
	render: function() {
		var Item = this.props.data.map(function(todo) {
			return (
				<li key={todo.uuid} className="todoItem">
					<form id={todo.uuid} className="input-group itemGroup view">
						<span className="input-group-addon">
							<input
								className="itemCB"
								type="checkbox"
								onChange={this.handleCheck.bind(this, todo.uuid)}
								checked={todo.completed}
							/>
						</span>
						<div className="form-control-static item itemVal">
							<label onDoubleClick={this.handleEdit.bind(this, todo.uuid, todo.completed)}>{todo.title}</label>
							<input 
								type="text"
								className="editInput"
								style={{display:"none"}}
								value={todo.title}
								onBlur={this.handleBlur.bind(this, todo.uuid)}
								onChange={this.handleChange}
								onKeyDown={this.handleKeyDown}
							/>
						</div>
						<span className="input-group-btn input-group-addon">
							<button
								type="button"
								className="close"
								aria-label="Close"
								onClick={this.handleClose.bind(this, todo.uuid)}
							>
							<span aria-hidden="true">&times;</span></button>
						</span>
					</form>
				</li>
			);
		}, this);
		return (
			<div>
				{Item}
			</div>
		);
	}
});

var TodoListBox = React.createClass({
	getInitialState: function() {
		return {data: []};
	},
	checkChecked: function() {
		var check = $('.itemCB');
		var label = $('.item');
		for (var i = 0; i < check.length; i += 1) {
			if (check[i].checked) {
				label[i].children[0].style.fontWeight = 'normal';
				label[i].children[0].style.textDecoration = 'line-through';
				label[i].children[0].style.color = 'grey';
			} else {
				label[i].children[0].style.fontWeight = 'bold';
				label[i].children[0].style.textDecoration = 'none';
				label[i].children[0].style.color = '#333333';			
			}
		}
	},
	loadDataFromServer: function() {
		$.ajax({
			url: this.props.url,
			type: 'GET',
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({data: data});
				this.checkChecked()
			}.bind(this),
				error: function(xhr, status, err) {
				console.error('api/get', status, err.toString());
			}.bind(this)
		});
	}, 
	componentDidMount: function(e) {
		this.loadDataFromServer()
	},
	handleItemSubmit: function(newItem) {
		$.ajax({
			url: this.props.url,
			type: 'POST',
			data: newItem,
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({data: data});
				this.checkChecked();
			}.bind(this),
			error: function(xhr, status, err) {
				console.error('/api/server', status, err.toString());
			}.bind(this)
		});
 	},
	handleCheckChanged: function(e) {
		var data = this.state.data;
		for (var i=0; i < data.length; i+=1) {
			if (e == data[i].uuid) {
				data[i].completed = !data[i].completed;
				this.handleItemSubmit(data[i]);
			}
		}
	},
	handleOnClose: function(e) {
		var data = this.state.data;
		for (var i=0; i < data.length; i+=1) {
			if (e == data[i].uuid) {
				$.ajax({
					url: '/api/destroy',
					type: 'POST',
					data: data[i],
					dataType: 'json',
					cache: false,
					success: function(data) {
						this.setState({data:data});
						this.checkChecked();
					}.bind(this),
					error: function(xhr, status, err) {
						console.error('/api/server', status, err.toString());
					}.bind(this)
				});
			}
		}
	},
	handleOnEdit: function(e) {
		console.log(e);
		$(e)[0].children[0].children[0].style.display="none";
		$(e)[0].children[1].children[0].style.display="none";
		$(e)[0].children[1].children[1].style.display="";
		$(e)[0].children[2].children[0].style.display="none";
		$(e)[0].children[1].children[1].focus();
	},
	handleOnBlur: function(e) {
		console.log(e);
		$(e)[0].children[0].children[0].style.display="";
		$(e)[0].children[1].children[0].style.display="";
		$(e)[0].children[1].children[1].style.display="none";
		$(e)[0].children[2].children[0].style.display="";
	},
	render: function() {
		return (
			<div className="todoBox">
				<div className="col-sm-8 col-sm-offset-2">
					<div id="newItem" className="col-xs-12">
						<NewItemBox onItemSubmit={this.handleItemSubmit}/>
					</div>
				</div>
				<div className="col-sm-8 col-sm-offset-2">
					<div id="todoList" className="col-xs-12">
						<ul className="todoItemList">
							<TodoItem data={this.state.data} onCheckChanged={this.handleCheckChanged} onClose={this.handleOnClose} onEdit={this.handleOnEdit} onBlur={this.handleOnBlur}/>
						</ul>
					</div>
				</div>
			</div>
		);
	}
});
ReactDOM.render(
  <TodoListBox url="/api/server" />,
  document.getElementById('content')
);
 
 
