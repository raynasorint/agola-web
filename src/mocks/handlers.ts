import { rest } from 'msw';

export const handlers = [
  rest.get(
    'http://localhost:8000/api/v1alpha/projectgroups/user%2Frivanova/secrets',
    (req, res, ctx) => {
      const isAuthenticated = sessionStorage.getItem('is-authenticated');

      if (!isAuthenticated) {
        return res(
          ctx.status(403),
          ctx.json({
            errorMessage: 'Not authorized',
          })
        );
      }

      return res(
        ctx.status(200),
        ctx.json({
          id: 'a5652bd8-547e-4523-9f56-82de2db868fd',
          name: 'sds',
          parent_path: 'user/rivanova',
        })
      );
    }
  ),

  rest.post(
    'http://localhost:8000/api/v1alpha/projectgroups/user%2Frivanova/secrets',
    async (req, res, ctx) => {
      const requestBody = await req.text();
      const parsedBody = JSON.parse(requestBody);

      const secretname = parsedBody.name;
      //const secretType = parsedBody.type;
      //const secretData = parsedBody.data;

      return res(
        ctx.json({
          id: '0abfe045-659a-4ae5-8529-330f153a7c6a',
          name: secretname,
          parent_path: 'user/rivanova',
        })
      );
    }
  ),

  rest.delete(
    'http://localhost:8000/api/v1alpha/projectgroups/user%2Frivanova/secrets/:secretname',
    (req, res, ctx) => {
      return res(ctx.status(200));
    }
  ),
];
