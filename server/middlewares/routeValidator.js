export const validateRoutes = (router) => {
  router.stack.forEach((layer) => {
    if (layer.route) {
      console.log(`Validating route: ${layer.route.path}`);
      // Check for malformed parameters
      if (layer.route.path.includes(":") && !layer.route.path.match(/:\w+/)) {
        throw new Error(`Invalid route parameter in path: ${layer.route.path}`);
      }
    }
  });
};
