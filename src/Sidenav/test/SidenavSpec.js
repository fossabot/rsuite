import React from 'react';
import ReactTestUtils, { act, Simulate } from 'react-dom/test-utils';
import { getByTestId, render } from '@testing-library/react';
import { getDOMNode } from '@test/testUtils';

import Sidenav from '../Sidenav';
import Nav from '../../Nav';
import Dropdown from '../../Dropdown';
import userEvent from '@testing-library/user-event';

describe('<Sidenav>', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('Should render a navigation', () => {
    const instance = getDOMNode(<Sidenav />);
    assert.include(instance.className, 'rs-sidenav');
  });

  it('Should apply appearance', () => {
    const instance = getDOMNode(<Sidenav appearance="subtle" />);
    assert.include(instance.className, 'rs-sidenav-subtle');
  });

  it('Should be expanded', () => {
    const instance = getDOMNode(<Sidenav expanded />);
    assert.include(instance.className, 'rs-sidenav-collapse-in');
  });

  it('Should call onSelect callback', () => {
    const consoleWarnSpy = sinon.spy(console, 'warn');

    const onSelectSpy = sinon.spy();

    const instance = getDOMNode(
      <Sidenav onSelect={onSelectSpy}>
        <Nav>
          <Nav.Item eventKey="1">a</Nav.Item>
          <Nav.Item eventKey="2">b</Nav.Item>
        </Nav>
      </Sidenav>
    );

    ReactTestUtils.Simulate.click(instance.querySelector('.rs-nav-item'));

    expect(consoleWarnSpy, 'Deprecation warning').to.have.been.calledWith(
      sinon.match(/onselect.+deprecated/i)
    );
    expect(onSelectSpy, 'onSelect').to.have.been.calledWith('1');
  });

  it('Should call onOpenChange callback', done => {
    const doneOp = () => {
      done();
    };
    const instance = getDOMNode(
      <Sidenav onOpenChange={doneOp}>
        <Nav>
          <Nav.Item eventKey="1">a</Nav.Item>
          <Nav.Item eventKey="2">b</Nav.Item>
          <Dropdown eventKey="3" title="3">
            <Dropdown.Item eventKey="3-1">3-1</Dropdown.Item>
            <Dropdown.Item eventKey="3-2">3-2</Dropdown.Item>
          </Dropdown>
        </Nav>
      </Sidenav>
    );

    ReactTestUtils.Simulate.click(instance.querySelector('.rs-dropdown-toggle'));
  });

  it('Should open the default menu', () => {
    const instance = getDOMNode(
      <Sidenav defaultOpenKeys={['1', '2']}>
        <Sidenav.Body>
          <Nav>
            <Dropdown eventKey="1" title="1" data-testid="menu-1">
              <Dropdown.Item eventKey="1-1">Geo</Dropdown.Item>
            </Dropdown>
            <Dropdown eventKey="2" title="2" data-testid="menu-2">
              <Dropdown.Item eventKey="2-1">2-1</Dropdown.Item>
              <Dropdown.Menu eventKey="2-2" title="2-2" className="m-2-2">
                <Dropdown.Item eventKey="2-2-1">2-2-1</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    );

    ['1', '2'].forEach(key => {
      const menu = getByTestId(instance, `menu-${key}`);

      assert.ok(
        menu.querySelector('[role="group"]').classList.contains('rs-dropdown-menu-collapse-in'),
        `Menu ${key} has transition class`
      );
    });

    assert.ok(
      instance.querySelector('.m-2-2').getAttribute('aria-expanded') !== 'true',
      'Menu 2-2 should not be open'
    );
    assert.ok(
      instance
        .querySelector('.m-2-2')
        .querySelector('[role="group"]')
        .classList.contains('rs-dropdown-menu-collapse-out'),
      'Menu 2-2 has transition class'
    );
  });

  it('<Dropdown> inside collapsed <Sidenav> should contain a header in its menu', () => {
    const instance = getDOMNode(
      <Sidenav expanded={false}>
        <Sidenav.Body>
          <Nav>
            <Dropdown eventKey="1" title="1" className="m-1">
              <Dropdown.Item eventKey="1-1">Geo</Dropdown.Item>
            </Dropdown>
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    );

    act(() => {
      Simulate.click(instance.querySelector('.m-1'));
    });

    expect(instance.querySelector('.rs-dropdown-header')).not.to.be.null;
  });

  it('Should have a custom className', () => {
    const instance = getDOMNode(<Sidenav className="custom" />);
    assert.include(instance.className, 'custom');
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = getDOMNode(<Sidenav style={{ fontSize }} />);
    assert.equal(instance.style.fontSize, fontSize);
  });

  it('Should have a custom className prefix', () => {
    const instance = getDOMNode(<Sidenav classPrefix="custom-prefix" />);
    assert.ok(instance.className.match(/\bcustom-prefix\b/));
  });

  it('Should set `aria-selected=true` on the item indicated by `activeKey`', () => {
    const consoleWarnSpy = sinon.spy(console, 'warn');

    const instance = getDOMNode(
      <Sidenav activeKey="1">
        <Nav>
          <Nav.Item eventKey="1" id="selected-item">
            a
          </Nav.Item>
          <Nav.Item eventKey="2">b</Nav.Item>
        </Nav>
      </Sidenav>
    );
    expect(consoleWarnSpy, 'Deprecation warning').to.have.been.calledWith(
      sinon.match(/activekey.+deprecated/i)
    );
    expect(instance.querySelector('#selected-item').getAttribute('aria-selected')).to.equal('true');
  });

  it('Should mark <Dropdown.Item> matching <Nav> `activeKey` as current', () => {
    const { getByTestId } = render(
      <Sidenav>
        <Nav activeKey="2-1">
          <Dropdown title="Dropdown">
            <Dropdown.Item eventKey="2-1" data-testid="dropdown-item">
              Dropdown item
            </Dropdown.Item>
          </Dropdown>
        </Nav>
      </Sidenav>
    );

    expect(getByTestId('dropdown-item')).to.have.attribute('aria-current', 'true');
    // The accent style
    expect(getByTestId('dropdown-item')).to.have.class('rs-dropdown-item-active');
  });

  it('Should call <Nav onSelect> with correct eventKey from <Dropdown.Item>', () => {
    const onSelectSpy = sinon.spy();
    const { getByTestId } = render(
      <Sidenav>
        <Nav activeKey="2-1" onSelect={onSelectSpy}>
          <Dropdown title="Dropdown" data-testid="dropdown">
            <Dropdown.Item eventKey="2-1" data-testid="dropdown-item">
              Dropdown item
            </Dropdown.Item>
          </Dropdown>
        </Nav>
      </Sidenav>
    );

    // opens the dropdown
    userEvent.click(getByTestId('dropdown'));

    userEvent.click(getByTestId('dropdown-item'));
    expect(onSelectSpy).to.have.been.calledWith('2-1', sinon.match.any);
  });
});
