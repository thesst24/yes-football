import { Routes } from '@angular/router';
import { Card } from './components/card/card';
import { UserLogin } from './user/user-login/user-login';
import { Sidebar } from './components/sidebar/sidebar';
import { Members } from './admin/members/members';
import { AdminLogin } from './admin/admin-login/admin-login';
import { Pages } from './admin/pages/pages';
import { AddMember } from './admin/members/add-member/add-member';
import { CheckIn } from './admin/check-in/check-in';
import { CardCheckin } from './admin/check-in/card-checkin/card-checkin';
import { EventUser } from './user/event-user/event-user';
import { Join } from './popup/join/join';

import { Setting } from './admin/setting/setting';
import { Report } from './admin/report/report';
import { Seasons } from './admin/seasons/seasons';
import { Events } from './admin/seasons/events/events';
import { CardUser } from './user/card-user/card-user';


export const routes: Routes = [
  { path: '', redirectTo: 'user-login', pathMatch: 'full' },
  { path: 'card', component: Card },
  { path: 'user-login', component: UserLogin },
  { path: 'card-user', component: CardUser},
  { path: 'card-checkin', component: CardCheckin },
  { path: 'admin-login', component: AdminLogin },

  { path: 'event-user', component: EventUser },
  { path: 'popupjoin', component: Join },
  {
    path: '',
    component: Pages,
    children: [
      { path: 'member', component: Members },
      { path: 'members/create', component: Members },
      { path: 'members/edit/:id', component: Members },
      { path: 'season', component: Seasons,
        children:[
          { path: 'events/:seasonId/:sessionId',component: Events },]
       },
      
      { path: 'checkin', component: CheckIn },
      { path: 'checkin/:seasonId/:sessionId', component: CheckIn },
      { path: 'report', component: Report },
      { path: 'setting', component: Setting },
    ],
  },
];
