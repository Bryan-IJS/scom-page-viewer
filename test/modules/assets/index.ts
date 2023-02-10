import { application, Styles } from '@ijstech/components';
const moduleDir = application.currentModuleDir;
type themeType = "light" | "dark";
type viewportType = "desktop" | "tablet" | "mobile";
interface ILogo {
    header: string;
    footer: string;
}
interface IBreakpoints {
    mobile: number;
    tablet: number;
    desktop: number;
}
class Assets {
    private static _instance: Assets;
    private _breakpoints: IBreakpoints;
    public static get instance() {
        if (!this._instance) this._instance = new this();
        return this._instance
    }
    get logo(): ILogo {
        let currentTheme = Styles.Theme.currentTheme;
        let theme: themeType = currentTheme === Styles.Theme.defaultTheme ? "light" : "dark";
        let _logo: ILogo = this._getLogo(this.viewport, theme);
        return _logo;
    }
    set breakpoints(value: IBreakpoints) {
        this._breakpoints = value;
    }
    get breakpoints() {
        return this._breakpoints;
    }
    get viewport(): viewportType {
        if (window.innerWidth > this._breakpoints?.tablet)
            return "desktop";
        else if (window.innerWidth > this._breakpoints?.mobile)
            return "tablet";
        else
            return "mobile"
    }
    private _getLogoPath(viewport: viewportType, theme: themeType, type: "header" | "footer"): string {
        let asset = application.assets(`logo/${type}`) || application.assets(`logo`);
        let path: string;
        if (typeof asset === 'object') {
            if (typeof asset[viewport] === 'object') {
                path = asset[viewport][theme]
            } else if (typeof asset[viewport] === 'string') {
                path = asset[viewport]
            } else if (asset[theme]) {
                4
                path = asset[theme]
            }
        } else if (typeof asset === 'string') {
            path = asset
        }
        return path;
    }
    private _getLogo(viewport: viewportType, theme: themeType): ILogo {
        const header = this._getLogoPath(viewport, theme, "header");
        const footer = this._getLogoPath(viewport, theme, "footer");
        return { header, footer }
    }
}
export const assets = Assets.instance;
function fullPath(path: string): string {
    return `${moduleDir}/${path}`
};
export default {
    fonts: {
        poppins: {
            bold: fullPath('fonts/poppins/PoppinsBold.ttf'),
            italic: fullPath('fonts/poppins/PoppinsItalic.ttf'),
            light: fullPath('fonts/poppins/PoppinsLight.ttf'),
            medium: fullPath('fonts/poppins/PoppinsMedium.ttf'),
            regular: fullPath('fonts/poppins/PoppinsRegular.ttf'),
            thin: fullPath('fonts/poppins/PoppinsThin.ttf'),
        }
    },
    logo: {
        header: {
            desktop: fullPath('img/logo.svg'),
            tablet: {
                light: fullPath('img/logo-mobile.svg'),
                dark: fullPath('img/logo-mobile-dark.svg'),
            },
            mobile: {
                light: fullPath('img/logo-mobile.svg'),
                dark: fullPath('img/logo-mobile-dark.svg'),
            }
        },
        footer: {
            light: fullPath('img/logo-mobile.svg'),
            dark: fullPath('img/logo-mobile-dark.svg'),
        }
    },
    img: {
        network: {
            bsc: fullPath('img/network/bsc.svg'),
            eth: fullPath('img/network/eth.svg'),
            amio: fullPath('img/network/amio.svg'),
            avax: fullPath('img/network/avax.svg'),
            ftm: fullPath('img/network/ftm.svg'),
            polygon: fullPath('img/network/polygon.svg'),
        },
        wallet: {
            metamask: fullPath('img/wallet/metamask.png'),
            trustwallet: fullPath('img/wallet/trustwallet.svg'),
            binanceChainWallet: fullPath('img/wallet/binance-chain-wallet.svg'),
            walletconnect: fullPath('img/wallet/walletconnect.svg')
        }
    },
    fullPath
};