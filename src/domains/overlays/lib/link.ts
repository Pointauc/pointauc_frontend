interface LinkParams {
  id: string;
  token: string;
}

export const buildOverlayLink = (params: LinkParams) => {
  return `${window.location.origin}/overlays/view/${params.id}?token=${params.token}`;
};
