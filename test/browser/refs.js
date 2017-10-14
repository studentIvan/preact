import { h, render, Component } from '../../src/preact';
/** @jsx h */

// gives call count and argument errors names (otherwise sinon just uses "spy"):
let spy = (name, ...args) => {
	let spy = sinon.spy(...args);
	spy.displayName = `spy('${name}')`;
	return spy;
};

describe('refs', () => {
	let scratch;

	before( () => {
		scratch = document.createElement('div');
		(document.body || document.documentElement).appendChild(scratch);
	});

	beforeEach( () => {
		scratch.innerHTML = '';
	});

	after( () => {
		scratch.parentNode.removeChild(scratch);
		scratch = null;
	});

	it('should pass components to ref functions', () => {
		let ref = spy('ref'),
			instance;
		class Foo extends Component {
			constructor() {
				super();
				instance = this;
			}
			render() {
				return <div />;
			}
		}
		render(<Foo ref={ref} />, scratch);

		expect(ref).to.have.been.calledOnce.and.calledWith(instance);
	});

	it('should pass rendered DOM from functional components to ref functions', () => {
		let ref = spy('ref');

		const Foo = () => <div />;

		let root = render(<Foo ref={ref} />, scratch);
		expect(ref).to.have.been.calledOnce;

		ref.reset();
		render(<Foo ref={ref} />, scratch, root);
		expect(ref).to.have.been.calledOnce;

		ref.reset();
		render(<span />, scratch, root);
		expect(ref).to.have.been.calledOnce.and.calledWith(null);
	});

	it('should not pass ref into component as a prop', () => {
		let foo = spy('foo'),
			bar = spy('bar');

		class Foo extends Component {
			render(){ return <div />; }
		}
		const Bar = spy('Bar', () => <div />);

		sinon.spy(Foo.prototype, 'render');

		render((
			<div>
				<Foo ref={foo} a="a" />
				<Bar ref={bar} b="b" />
			</div>
		), scratch);

		expect(Foo.prototype.render).to.have.been.calledWithMatch({ ref:sinon.match.falsy, a:'a' }, { }, { });
		expect(Bar).to.have.been.calledWithMatch({ b:'b', ref:sinon.match.falsy }, { });
	});

});
