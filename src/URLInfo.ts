export class URLInfo {

    isTikTok: boolean;
    isSound: boolean;
    isUser: boolean;
    isVideo: boolean;
    badgeText: string;

    constructor(url: URL) {
        this.isTikTok = url.host === "www.tiktok.com";
        const pathComponents = url.pathname.split('/');
        const firstComponent = pathComponents.length > 1 ? pathComponents[1] : pathComponents[0];
        this.isSound = this.isTikTok && firstComponent === "music";
        this.isVideo = this.isTikTok && pathComponents.length > 2 && pathComponents[2] == "video";
        this.isUser = this.isTikTok && !this.isVideo && firstComponent[0] === '@';
        this.badgeText = this.isSound ? "S" : this.isVideo ? "V" : this.isUser ? "U" : this.isTikTok ? "?" : "";
    }
}
