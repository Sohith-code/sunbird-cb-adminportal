
import { MatDialogRef } from '@angular/material/dialog'
import { UntypedFormBuilder } from '@angular/forms'
import { DialogTextProfanityComponent } from './discussion-post-popup.component'
import { IDialogData } from './discussion-post.component'

describe('DialogTextProfanityComponent', () => {
    let component: DialogTextProfanityComponent

    const fb = new UntypedFormBuilder()
    const dialogRef: Partial<MatDialogRef<DialogTextProfanityComponent>> = {}
    const data: Partial<IDialogData> = { profaneCategories: ['abuse', 'hate'], text: 'text', id: '1', profaneString: 'bad' }

    beforeAll(() => {
        component = new DialogTextProfanityComponent(
            fb,
            dialogRef as MatDialogRef<DialogTextProfanityComponent>,
            data as IDialogData
        )
    })

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })

    it('should build a form group control for each profane category', () => {
        expect(component.profaneGroup.get('abuse')!.value).toBe(false)
        expect(component.profaneGroup.get('hate')!.value).toBe(false)
    })
})
