const keys = {
    Nearby: 1,
    ScanLabel: 2,
    SearchWines: 3,
    MyProfile: 4,
    SocialFeed: 5,
    Login: 6,
    Logout: 6,
    Intro: 7,
};

export default function (id = 1) {
    const value = typeof id === 'string' ? keys[id] : id;
    return this.idFromXPath(`//
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/
        android.support.v4.widget.DrawerLayout[1]/android.widget.FrameLayout[1]/
        android.widget.FrameLayout[1]/android.widget.LinearLayout[1]/
        android.support.v7.widget.RecyclerView[1]/android.widget.Button[${value}]
    `)
}
