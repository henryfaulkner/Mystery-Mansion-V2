export type Process = {
    pid?: ExploreRoomStates | ExploreFurnitureStates;
    action: 'explore-room' | 'explore-furniture';
    status: 'begin' | 'continue' | 'finish';
}

export enum ExploreRoomStates {
    Begin,
    CheckLockedRoom,
    ListFurniture,
    Finish,
}

export enum ExploreFurnitureStates {
    Begin,
    CheckNoteItem,
    CheckNoteItemInput,
    CheckNotePerson,
    CheckNotePersonInput,
    CheckNoteClue,
    CheckNoteSecret,
    CheckNoteSecretInput,
    CheckNoteLookIn,
    CheckNoteNotIn,
    CheckNoteMoney,
    BaseCase,
    Finish,
}