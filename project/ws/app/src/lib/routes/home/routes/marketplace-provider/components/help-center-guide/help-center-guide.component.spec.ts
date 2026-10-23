(window as any)['env'] = {
    name: 'test-environment',
    sitePath: '/test-site-path',
    karmYogiPath: '/test-karm-yogi-path',
    cbpPath: '/test-cbp-path',
}
import { MatDialog } from '@angular/material/dialog'
import { HelpCenterGuideComponent } from './help-center-guide.component'


describe('HelpCenterGuideComponent', () => {
    let component: HelpCenterGuideComponent
    const dialog = { open: jest.fn() }

    beforeAll(() => {
        component = new HelpCenterGuideComponent(
            dialog as unknown as MatDialog
        )
    })

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })

    describe('ngOnInit', () => {
        it('calling ngOnInit', () => {
            component.ngOnInit()
        })
    })

    describe('openVideoPopup', () => {
        it('calling openVideoPopup', () => {
            component.helpCenterGuide = { helpVideoLink: '/video.mp4' }
            component.openVideoPopup()
            expect(dialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
                data: { videoLink: expect.stringContaining('/video.mp4') },
                disableClose: true,
            }))
        })
    })

    describe('callResizeEvent', () => {
        it('calling callResizeEvent', () => {
            jest.useFakeTimers()
            const el = document.createElement('div')
            el.className = 'flex'
            document.body.appendChild(el)
            const spy = jest.spyOn(window, 'dispatchEvent')
            component.callResizeEvent('')
            jest.advanceTimersByTime(100)
            expect(spy).toHaveBeenCalled()
            document.body.removeChild(el)
            spy.mockRestore()
            jest.useRealTimers()
        })
    })

})
