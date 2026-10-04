// router.js - 简单 Hash 路由系统

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const path = hash.split('?')[0];

    // 匹配路由
    let handler = this.routes[path];
    if (!handler) {
      // 尝试精确匹配
      handler = this.routes[path] || this.routes['/'];
    }

    if (handler) {
      this.currentRoute = path;
      handler();
    }
  }

  navigate(path) {
    window.location.hash = path;
  }

  getCurrentPath() {
    return this.currentRoute;
  }
}

export const router = new Router();
export default router;
