import { Module, Styles, Container, customModule, application, Panel } from '@ijstech/components';
import { } from '@ijstech/eth-contract';
import styleClass from './index.css';
import { updateNetworks } from './network';
import { updateWallets } from './wallet';
export { Header } from './header';
export { Footer } from './footer';
import { match, MatchFunction, compile } from './pathToRegexp'
import { assets } from '@modules/assets';
import { Header } from './header';
import { Footer } from './footer';
import { IMenu, IRoute, ISCConfig, ITheme } from './interface';
Styles.Theme.applyTheme(Styles.Theme.darkTheme);

@customModule
export default class MainLauncher extends Module {
  private pnlMain: Panel;
  private menuItems: any[];
  private _options: ISCConfig;
  private currentModule: Module;
  private headerElm: Header;
  private footerElm: Footer;
  private pnlScrollable: Panel;

  constructor(parent?: Container, options?: any) {
    super(parent, options);
    this.classList.add(styleClass);
    this._options = options;
    let defaultRoute: IRoute | undefined = this._options?.routes?.find(route => route.default);
    if (defaultRoute && (!location.hash || location.hash === '#/')) {
      const toPath = compile(defaultRoute.url, { encode: encodeURIComponent });
      location.hash = toPath();
    } else {
      this.handleHashChange();
    }
  }

  async init() {
    window.onhashchange = this.handleHashChange.bind(this);
    this.menuItems = this.options.menus || [];
    assets.breakpoints = this.options.breakpoints;
    updateNetworks(this.options);
    updateWallets(this.options);
    this.updateThemes(this.options.themes)
    super.init();
    this.updateLayout();
  }

  hideCurrentModule() {
    if (this.currentModule) {
      this.currentModule.style.display = 'none';
      this.currentModule.onHide();
    }
  }

  async getModuleByPath(path: string): Promise<{
    module: Module,
    data?: any
  }> {
    let menu: IMenu | IRoute;
    let data: any;
    let list: Array<IMenu | IRoute> = [...this._options.routes || [], ...this._options.menus || []];
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      if (item.url == path) {
        menu = item;
        if ("data" in menu)
          data = menu.data;
        break;
      }
      else {
        if (!item.regex)
          item.regex = match(item.url, { decode: decodeURIComponent })

        let _match = item.regex(path);
        if (_match !== false) {
          menu = item;
          data = "data" in menu ? Object.assign({ ...menu.data }, _match.params) : _match.params;
          break;
        };
      };
    };
    if (menu) {
      let menuObj: any = menu;
      if (!menuObj.moduleObject) {
        menuObj.moduleObject = await application.loadModule(menu.module, this._options);
        if (menuObj.moduleObject) menuObj.moduleObject.onLoad();
      }
      return {
        module: menuObj.moduleObject,
        data: data
      };
    }
  }

  async handleHashChange() {
    let path = location.hash.split("?")[0];
    if (path.startsWith('#/'))
      path = path.substring(1);
    let module = await this.getModuleByPath(path);
    if (module?.module != this.currentModule)
      this.hideCurrentModule();
    this.currentModule = module?.module;
    if (module) {
      if (this.pnlMain.contains(module.module))
        module.module.style.display = 'initial';
      else
        this.pnlMain.append(module.module);
      module.module.onShow(module.data);
    };
  }

  mergeTheme = (target: Styles.Theme.ITheme, theme: Styles.Theme.ITheme) => {
    for (const key of Object.keys(theme)) {
      if (theme[key] instanceof Object) {
        Object.assign(theme[key], this.mergeTheme(target[key], theme[key]))
      }
    }
    Object.assign(target || {}, theme)
    return target
  }

  updateThemes(themes?: ITheme) {
    if (!themes) return;
    if (themes.dark) {
      this.mergeTheme(Styles.Theme.darkTheme, themes.dark);
    }
    if (themes.light) {
      this.mergeTheme(Styles.Theme.defaultTheme, themes.light);
    }
    const theme = themes.default === 'light' ? Styles.Theme.defaultTheme : Styles.Theme.darkTheme;
    Styles.Theme.applyTheme(theme);
  }

  updateLayout() {
    const header = this._options.header || {};
    const footer = this._options.footer || {};
    this.headerElm.visible = header.visible ?? true;
    this.footerElm.visible = footer.visible ?? true;
    if (header.fixed && footer.fixed) {
      this.pnlMain.overflow.y = 'auto';
    } else {
      if (header.fixed) {
        this.pnlScrollable.append(this.pnlMain);
        this.pnlScrollable.append(this.footerElm);
        this.pnlScrollable.visible = true;
      } else if (footer.fixed) {
        this.pnlScrollable.append(this.headerElm);
        this.pnlScrollable.append(this.pnlMain);
        this.pnlScrollable.visible = true;
      }
    }
  }

  async render() {
    return (
      <i-vstack height="inherit">
        <main-header id="headerElm" menuItems={this.menuItems} height="auto" width="100%"></main-header>
        <i-vstack id="pnlScrollable" visible={false} stack={{ grow: "1" }} overflow={{ y: 'auto' }}></i-vstack>
        <i-panel id="pnlMain" stack={{ grow: "1" }} ></i-panel>
        <main-footer
          id="footerElm"
          stack={{ shrink: '0' }}
          class='footer'
          height="auto"
          width="100%"
          copyrightInfo={this._options.copyrightInfo}
          version={this._options.version}
        ></main-footer>
      </i-vstack>
    )
  };
};