type NavigationState = {
	busy: boolean;
	dirty: boolean;
	readingPhotos: boolean;
	discarding: boolean;
	willUnload: boolean;
	popstate: boolean;
	dialogOpen: boolean;
};

export function navigationProtection(state: NavigationState) {
	if (state.discarding) return 'allow';
	if (state.busy) return 'busy';
	if (!state.willUnload && state.popstate && state.dialogOpen) return 'close-dialog';
	if (state.dirty || state.readingPhotos) return 'confirm';
	return 'allow';
}
