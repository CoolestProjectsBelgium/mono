(function (React, designSystem, adminjs, styledComponents) {
  'use strict';

  function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

  var React__default = /*#__PURE__*/_interopDefault(React);

  // src/frontend/login.tsx
  const Login = () => {
    const [events, setEvents] = React.useState([]);
    const [selectedEvent, setEvent] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
      const fetchEvents = async () => {
        try {
          const response = await fetch('/api/events');
          const data = await response.json();
          setEvents(data);
          // Pre-select current event if available
          const currentEvent = data.find(e => e.isCurrent);
          setEvent(currentEvent || data[0]);
        } catch (error) {
          console.error('Failed to fetch events:', error);
          setEvents([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchEvents();
    }, []);
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      margin: "auto",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      method: "POST",
      as: "form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H1, null, "Login"), /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        width: "400px"
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, {
      action: "login"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      htmlFor: "email"
    }, "Account"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      name: "email",
      type: "text",
      variant: "default"
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      htmlFor: "password"
    }, "Password"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      name: "password",
      type: "password",
      variant: "default"
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      htmlFor: "event"
    }, "Event"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "hidden",
      name: "event",
      value: selectedEvent?.value
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Select, {
      variant: "default",
      options: events,
      value: selectedEvent,
      onChange: setEvent,
      isLoading: isLoading,
      isDisabled: isLoading || events.length === 0
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "primary",
      type: "submit"
    }, "Login")));
  };

  const api = new adminjs.ApiClient();

  // 1. Unieke interface voor tabelitems (vragen & t-shirts)

  // 2. Hoofdinterface voor alle dashboardgegevens

  // Props interface voor de gestylede Card component

  const pageHeaderHeight = 300;
  const pageHeaderPaddingY = 54;
  const pageHeaderPaddingX = 300;
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const DashboardHeader = () => {
    const [data, setData] = React.useState({});
    React.useEffect(() => {
      let isSubscribed = true;
      api.getDashboard().then(response => {
        console.log('dashboard.tsx_02', response);
        if (isSubscribed) {
          setData(response.data);
        }
      });
      return () => {
        isSubscribed = false;
      };
    }, []);
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      position: "relative",
      overflow: "hidden"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "grey100",
      height: pageHeaderHeight,
      py: pageHeaderPaddingY,
      px: ['default', 'lg', pageHeaderPaddingX]
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      textAlign: "center",
      color: "white"
    }, /*#__PURE__*/React__default.default.createElement("h2", {
      style: {
        fontSize: '32px',
        fontWeight: 'bold',
        margin: '10px 0'
      }
    }, data.event_title), /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, "starting on : ", ' ', data.officialStartDate !== undefined ? new Intl.DateTimeFormat('en-BE', options).format(new Date(data.officialStartDate)) : 'No event'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, data.days_remaining, " days remaining"))));
  };

  // Volledig getypeerde Styled Component
  const Card = styledComponents.styled(designSystem.Box)`
  display: ${({
  flex
}) => flex ? 'flex' : 'block'};
  color: ${({
  theme
}) => theme.colors.grey100};
  height: 100%;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: ${({
  theme
}) => theme.space.md};
  transition: all 0.1s ease-in;

  &:hover {
    border: 1px solid ${({
  theme
}) => theme.colors.primary60};
    box-shadow: ${({
  theme
}) => theme.shadows.cardHover};
  }

  & .dsc-icon svg, .gh-icon svg {
    width: 64px;
    height: 64px;
  }
`;
  Card.defaultProps = {
    variant: 'container',
    boxShadow: 'card'
  };
  const Dashboard = () => {
    const [data, setData] = React.useState({});
    React.useEffect(() => {
      let isSubscribed = true;
      api.getDashboard().then(response => {
        if (isSubscribed) {
          setData(response.data);
        }
      });
      return () => {
        isSubscribed = false;
      };
    }, []);
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, null, /*#__PURE__*/React__default.default.createElement(DashboardHeader, null), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: ['xl', 'xl', '-100px'],
      mb: "xl",
      mx: [0, 0, 0, 'auto'],
      px: ['default', 'lg', 'xxl', '0'],
      position: "relative",
      flex: true,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignContent: "flex-start",
      width: [1, 1, 1, 1024]
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1 / 2],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "Status Registrations"), /*#__PURE__*/React__default.default.createElement("ul", null, /*#__PURE__*/React__default.default.createElement("li", null, data.pending_users ?? 0, " Registrations Pending"), /*#__PURE__*/React__default.default.createElement("li", null, data.overdue_registration ?? 0, " Overdue registrations"), /*#__PURE__*/React__default.default.createElement("li", null, data.waiting_list ?? 0, " On waiting list"), /*#__PURE__*/React__default.default.createElement("li", null, data.total_unusedVouchers ?? 0, " unused vouchers"))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1 / 2],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "Status Projects"), /*#__PURE__*/React__default.default.createElement("ul", null, /*#__PURE__*/React__default.default.createElement("li", null, data.total_projects ?? 0, "/", data.maxRegistration ?? 0, " Projects Remaining / with", ' ', data.total_usedVouchers ?? 0, " Co-Worker(s)"), /*#__PURE__*/React__default.default.createElement("li", null, (data.total_users || 0) - (data.total_usedVouchers || 0) - (data.total_projects || 0), " user(s) without Project"), /*#__PURE__*/React__default.default.createElement("li", null, data.total_videos ?? 0, " Project(s) with foto/video confirmed"))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1 / 2],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "Statistics Users (total:", data.total_users ?? 0, ")"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "row",
      justifyContent: "space-between",
      position: "relative"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1 / 2]
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H5, null, "Languages"), /*#__PURE__*/React__default.default.createElement("ul", null, /*#__PURE__*/React__default.default.createElement("li", null, data.tlang_nl || 0, " nl"), /*#__PURE__*/React__default.default.createElement("li", null, data.tlang_fr || 0, " fr"), /*#__PURE__*/React__default.default.createElement("li", null, data.tlang_en || 0, " en"))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1 / 2]
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H5, null, "Sex"), /*#__PURE__*/React__default.default.createElement("ul", null, /*#__PURE__*/React__default.default.createElement("li", null, data.total_females || 0, " females"), /*#__PURE__*/React__default.default.createElement("li", null, data.total_males || 0, " males"), /*#__PURE__*/React__default.default.createElement("li", null, data.total_X || 0, " X"))))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl",
      width: "100%"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "Answers controle list"), /*#__PURE__*/React__default.default.createElement(designSystem.Table, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableHead, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "total"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "short"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "description"))), /*#__PURE__*/React__default.default.createElement(designSystem.TableBody, null, data.questions && data.questions.map(question => /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, {
      key: question.id
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, question.total), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, question.short), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, question.description)))))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl",
      width: "100%"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "T-Shirts order list"), /*#__PURE__*/React__default.default.createElement(designSystem.Table, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableHead, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "total"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "short"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "description"))), /*#__PURE__*/React__default.default.createElement(designSystem.TableBody, null, data.tshirts && data.tshirts.map(tshirt => /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, {
      key: tshirt.id
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, tshirt.total), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, tshirt.short), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, tshirt.description))))))))));
  };

  const PasswordEdit = props => {
    const {
      onChange,
      property,
      record,
      resource
    } = props;
    const {
      translateButton: tb
    } = adminjs.useTranslation();
    const [showPassword, togglePassword] = React.useState(false);
    React.useEffect(() => {
      if (!showPassword) {
        onChange(property.name, '');
      }
    }, [onChange, showPassword]);
    // For new records always show the property
    if (!record.id) {
      return /*#__PURE__*/React__default.default.createElement(adminjs.BasePropertyComponent.Password.Edit, props);
    }
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, null, showPassword && /*#__PURE__*/React__default.default.createElement(adminjs.BasePropertyComponent.Password.Edit, props), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      textAlign: "center"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      onClick: () => togglePassword(!showPassword),
      type: "button"
    }, showPassword ? tb('cancel', resource.id) : tb('changePassword', resource.id)))));
  };

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.Login = Login;
  AdminJS.UserComponents.Dashboard = Dashboard;
  AdminJS.UserComponents.PasswordEditComponent = PasswordEdit;

})(React, AdminJSDesignSystem, AdminJS, styled);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvY29tcG9uZW50cy9Mb2dpbi50c3giLCIuLi9zcmMvY29tcG9uZW50cy9EYXNoYm9hcmQudHN4IiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BhZG1pbmpzL3Bhc3N3b3Jkcy9idWlsZC9jb21wb25lbnRzL1Bhc3N3b3JkRWRpdENvbXBvbmVudC5qc3giLCJlbnRyeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzcmMvZnJvbnRlbmQvbG9naW4udHN4XG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7XG4gIEJveCxcbiAgQnV0dG9uLFxuICBJbnB1dCxcbiAgTGFiZWwsXG4gIEgxLFxuICBTZWxlY3QsXG4gIEZvcm1Hcm91cCxcbn0gZnJvbSBcIkBhZG1pbmpzL2Rlc2lnbi1zeXN0ZW1cIjtcblxuY29uc3QgTG9naW4gPSAoKSA9PiB7XG4gIGNvbnN0IFtldmVudHMsIHNldEV2ZW50c10gPSB1c2VTdGF0ZTxhbnlbXT4oW10pO1xuICBjb25zdCBbc2VsZWN0ZWRFdmVudCwgc2V0RXZlbnRdID0gdXNlU3RhdGU8YW55PihudWxsKTtcbiAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgZmV0Y2hFdmVudHMgPSBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCcvYXBpL2V2ZW50cycpO1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBzZXRFdmVudHMoZGF0YSk7XG4gICAgICAgIC8vIFByZS1zZWxlY3QgY3VycmVudCBldmVudCBpZiBhdmFpbGFibGVcbiAgICAgICAgY29uc3QgY3VycmVudEV2ZW50ID0gZGF0YS5maW5kKChlOiBhbnkpID0+IGUuaXNDdXJyZW50KTtcbiAgICAgICAgc2V0RXZlbnQoY3VycmVudEV2ZW50IHx8IGRhdGFbMF0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGZldGNoIGV2ZW50czonLCBlcnJvcik7XG4gICAgICAgIHNldEV2ZW50cyhbXSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgfVxuICAgIH07XG4gICAgZmV0Y2hFdmVudHMoKTtcbiAgfSwgW10pO1xuXG4gIHJldHVybiAoXG4gICAgPEJveFxuICAgICAgbWFyZ2luPVwiYXV0b1wiXG4gICAgICBoZWlnaHQ9XCIxMDB2aFwiXG4gICAgICBkaXNwbGF5PVwiZmxleFwiXG4gICAgICBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgIGFsaWduSXRlbXM9XCJjZW50ZXJcIlxuICAgICAganVzdGlmeUNvbnRlbnQ9XCJjZW50ZXJcIlxuICAgICAgbWV0aG9kPVwiUE9TVFwiIGFzPVwiZm9ybVwiXG4gICAgPlxuICAgICAgPEgxPkxvZ2luPC9IMT5cbiAgICAgIDxzZWN0aW9uIHN0eWxlPXt7IHdpZHRoOiBcIjQwMHB4XCIgfX0+XG4gICAgICAgIDxGb3JtR3JvdXAgYWN0aW9uPVwibG9naW5cIiA+XG4gICAgICAgICAgPExhYmVsIGh0bWxGb3I9XCJlbWFpbFwiPkFjY291bnQ8L0xhYmVsPlxuICAgICAgICAgIDxJbnB1dCBuYW1lPVwiZW1haWxcIiB0eXBlPVwidGV4dFwiIHZhcmlhbnQ9XCJkZWZhdWx0XCIgLz5cbiAgICAgICAgICA8TGFiZWwgaHRtbEZvcj1cInBhc3N3b3JkXCI+UGFzc3dvcmQ8L0xhYmVsPlxuICAgICAgICAgIDxJbnB1dCBuYW1lPVwicGFzc3dvcmRcIiB0eXBlPVwicGFzc3dvcmRcIiB2YXJpYW50PVwiZGVmYXVsdFwiIC8+XG4gICAgICAgICAgPExhYmVsIGh0bWxGb3I9XCJldmVudFwiPkV2ZW50PC9MYWJlbD5cbiAgICAgICAgICA8SW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJldmVudFwiIHZhbHVlPXtzZWxlY3RlZEV2ZW50Py52YWx1ZX0gLz5cbiAgICAgICAgICA8U2VsZWN0IFxuICAgICAgICAgICAgdmFyaWFudD1cImRlZmF1bHRcIiBcbiAgICAgICAgICAgIG9wdGlvbnM9e2V2ZW50c30gXG4gICAgICAgICAgICB2YWx1ZT17c2VsZWN0ZWRFdmVudH0gXG4gICAgICAgICAgICBvbkNoYW5nZT17c2V0RXZlbnR9XG4gICAgICAgICAgICBpc0xvYWRpbmc9e2lzTG9hZGluZ31cbiAgICAgICAgICAgIGlzRGlzYWJsZWQ9e2lzTG9hZGluZyB8fCBldmVudHMubGVuZ3RoID09PSAwfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvRm9ybUdyb3VwPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJwcmltYXJ5XCIgdHlwZT1cInN1Ym1pdFwiPkxvZ2luPC9CdXR0b24+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgPC9Cb3g+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBMb2dpbjtcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBBcGlDbGllbnQgfSBmcm9tICdhZG1pbmpzJ1xuXG5pbXBvcnQgeyBcbiAgICBCb3gsIFxuICAgIEg0LFxuICAgIEg1LFxuICAgIFRhYmxlLFxuICAgIFRhYmxlUm93LFxuICAgIFRhYmxlQm9keSxcbiAgICBUYWJsZUNlbGwsXG4gICAgVGFibGVIZWFkLFxuICAgIFRleHQgXG59IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyBzdHlsZWQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtL3N0eWxlZC1jb21wb25lbnRzJ1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KClcblxuLy8gMS4gVW5pZWtlIGludGVyZmFjZSB2b29yIHRhYmVsaXRlbXMgKHZyYWdlbiAmIHQtc2hpcnRzKVxuaW50ZXJmYWNlIFRhYmxlSXRlbSB7XG4gICAgaWQ6IHN0cmluZyB8IG51bWJlclxuICAgIHRvdGFsOiBudW1iZXIgfCBzdHJpbmdcbiAgICBzaG9ydDogc3RyaW5nXG4gICAgZGVzY3JpcHRpb246IHN0cmluZ1xufVxuXG4vLyAyLiBIb29mZGludGVyZmFjZSB2b29yIGFsbGUgZGFzaGJvYXJkZ2VnZXZlbnNcbmludGVyZmFjZSBEYXNoYm9hcmREYXRhIHtcbiAgICBldmVudF90aXRsZT86IHN0cmluZ1xuICAgIG9mZmljaWFsU3RhcnREYXRlPzogc3RyaW5nXG4gICAgZGF5c19yZW1haW5pbmc/OiBudW1iZXJcbiAgICBwZW5kaW5nX3VzZXJzPzogbnVtYmVyXG4gICAgb3ZlcmR1ZV9yZWdpc3RyYXRpb24/OiBudW1iZXJcbiAgICB3YWl0aW5nX2xpc3Q/OiBudW1iZXJcbiAgICB0b3RhbF91bnVzZWRWb3VjaGVycz86IG51bWJlclxuICAgIHRvdGFsX3Byb2plY3RzPzogbnVtYmVyXG4gICAgbWF4UmVnaXN0cmF0aW9uPzogbnVtYmVyXG4gICAgdG90YWxfdXNlZFZvdWNoZXJzPzogbnVtYmVyXG4gICAgdG90YWxfdXNlcnM/OiBudW1iZXJcbiAgICB0b3RhbF92aWRlb3M/OiBudW1iZXJcbiAgICB0bGFuZ19ubD86IG51bWJlclxuICAgIHRsYW5nX2ZyPzogbnVtYmVyXG4gICAgdGxhbmdfZW4/OiBudW1iZXJcbiAgICB0b3RhbF9mZW1hbGVzPzogbnVtYmVyXG4gICAgdG90YWxfbWFsZXM/OiBudW1iZXJcbiAgICB0b3RhbF9YPzogbnVtYmVyXG4gICAgcXVlc3Rpb25zPzogVGFibGVJdGVtW11cbiAgICB0c2hpcnRzPzogVGFibGVJdGVtW11cbn1cblxuLy8gUHJvcHMgaW50ZXJmYWNlIHZvb3IgZGUgZ2VzdHlsZWRlIENhcmQgY29tcG9uZW50XG5pbnRlcmZhY2UgQ2FyZFByb3BzIHtcbiAgICBmbGV4PzogYm9vbGVhblxufVxuXG5jb25zdCBwYWdlSGVhZGVySGVpZ2h0ID0gMzAwXG5jb25zdCBwYWdlSGVhZGVyUGFkZGluZ1kgPSA1NFxuY29uc3QgcGFnZUhlYWRlclBhZGRpbmdYID0gMzAwXG5cbmNvbnN0IG9wdGlvbnM6IEludGwuRGF0ZVRpbWVGb3JtYXRPcHRpb25zID0ge1xuICAgIHllYXI6ICdudW1lcmljJyxcbiAgICBtb250aDogJzItZGlnaXQnLFxuICAgIGRheTogJzItZGlnaXQnXG59XG5cbmV4cG9ydCBjb25zdCBEYXNoYm9hcmRIZWFkZXI6IFJlYWN0LkZDID0gKCkgPT4ge1xuICAgIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlPERhc2hib2FyZERhdGE+KHt9KVxuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbGV0IGlzU3Vic2NyaWJlZCA9IHRydWVcbiAgICAgICAgYXBpLmdldERhc2hib2FyZCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZGFzaGJvYXJkLnRzeF8wMicsIHJlc3BvbnNlKVxuICAgICAgICAgICAgaWYgKGlzU3Vic2NyaWJlZCkge1xuICAgICAgICAgICAgICAgIHNldERhdGEocmVzcG9uc2UuZGF0YSBhcyBEYXNoYm9hcmREYXRhKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgaXNTdWJzY3JpYmVkID0gZmFsc2VcbiAgICAgICAgfVxuICAgIH0sIFtdKVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPEJveCBwb3NpdGlvbj1cInJlbGF0aXZlXCIgb3ZlcmZsb3c9XCJoaWRkZW5cIj5cbiAgICAgICAgICAgIDxCb3hcbiAgICAgICAgICAgICAgICBiZz1cImdyZXkxMDBcIlxuICAgICAgICAgICAgICAgIGhlaWdodD17cGFnZUhlYWRlckhlaWdodH1cbiAgICAgICAgICAgICAgICBweT17cGFnZUhlYWRlclBhZGRpbmdZfVxuICAgICAgICAgICAgICAgIHB4PXtbJ2RlZmF1bHQnLCAnbGcnLCBwYWdlSGVhZGVyUGFkZGluZ1hdfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxCb3ggdGV4dEFsaWduPVwiY2VudGVyXCIgY29sb3I9XCJ3aGl0ZVwiPlxuICAgICAgICAgICAgICAgICAgICA8aDIgc3R5bGU9e3sgZm9udFNpemU6ICczMnB4JywgZm9udFdlaWdodDogJ2JvbGQnLCBtYXJnaW46ICcxMHB4IDAnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAge2RhdGEuZXZlbnRfdGl0bGV9XG4gICAgICAgICAgICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgICAgICAgICAgIDxUZXh0PnN0YXJ0aW5nIG9uIDogeycgJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLm9mZmljaWFsU3RhcnREYXRlICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KCdlbi1CRScsIG9wdGlvbnMpLmZvcm1hdChuZXcgRGF0ZShkYXRhLm9mZmljaWFsU3RhcnREYXRlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdObyBldmVudCd9XG4gICAgICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgICAgICAgPFRleHQ+e2RhdGEuZGF5c19yZW1haW5pbmd9IGRheXMgcmVtYWluaW5nPC9UZXh0PlxuICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgIDwvQm94PlxuICAgIClcbn1cblxuLy8gVHlwZSBkZWZpbml0aWUgdm9vciBkZSBuYXZpZ2F0aWVibG9ra2VuIChpbmRpZW4gamUgZGV6ZSBsYXRlciB3aWwgcmVuZGVyZW4pXG50eXBlIEJveFR5cGUgPSB7XG4gICAgdGl0bGU6IHN0cmluZ1xuICAgIHN1YnRpdGxlOiBzdHJpbmdcbiAgICBocmVmOiBzdHJpbmdcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuY29uc3QgYm94ZXMgPSAoKTogQXJyYXk8Qm94VHlwZT4gPT4gW1xuICAgIHtcbiAgICAgICAgdGl0bGU6IFwiUmVnaXN0ZXJcIixcbiAgICAgICAgc3VidGl0bGU6IFwiUmVnaXN0ZXIgb24gYmVoYWxmIG9mIGEgcGFydGljaXBhbnRcIixcbiAgICAgICAgaHJlZjogJ2h0dHBzOi8vZG9jcy5hZG1pbmpzLmNvL2Jhc2ljcy9yZXNvdXJjZSNwcm92aWRpbmctcmVzb3VyY2VzLWV4cGxpY2l0bHknLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0aXRsZTogXCJVcGxvYWQgRm90b1wiLFxuICAgICAgICBzdWJ0aXRsZTogXCJVcGxvYWQgZm90b3Mgb24gYmVoYWxmIG9mIGEgcGFydGljaXBhbnRcIixcbiAgICAgICAgaHJlZjogJ2h0dHBzOi8vZG9jcy5hZG1pbmpzLmNvL2Jhc2ljcy9yZXNvdXJjZSNwcm92aWRpbmctcmVzb3VyY2VzLWV4cGxpY2l0bHknLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0aXRsZTogXCJTdGF0aXN0aWVrTmV3XCIsXG4gICAgICAgIHN1YnRpdGxlOiBcIlNob3cgc2V2ZXJhbCBzdGF0aXN0aWNzIGFib3V0IHRoZSBldmVudCBOZXdcIixcbiAgICAgICAgaHJlZjogJ2h0dHBzOi8vZG9jcy5hZG1pbmpzLmNvL2Jhc2ljcy9yZXNvdXJjZSNwcm92aWRpbmctcmVzb3VyY2VzLWV4cGxpY2l0bHknLFxuICAgIH0sXG5dXG5cbi8vIFZvbGxlZGlnIGdldHlwZWVyZGUgU3R5bGVkIENvbXBvbmVudFxuY29uc3QgQ2FyZCA9IHN0eWxlZChCb3gpPENhcmRQcm9wcz5gXG4gIGRpc3BsYXk6ICR7KHsgZmxleCB9KTogc3RyaW5nID0+IChmbGV4ID8gJ2ZsZXgnIDogJ2Jsb2NrJyl9O1xuICBjb2xvcjogJHsoeyB0aGVtZSB9KSA9PiB0aGVtZS5jb2xvcnMuZ3JleTEwMH07XG4gIGhlaWdodDogMTAwJTtcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICBib3JkZXI6IDFweCBzb2xpZCB0cmFuc3BhcmVudDtcbiAgYm9yZGVyLXJhZGl1czogJHsoeyB0aGVtZSB9KSA9PiB0aGVtZS5zcGFjZS5tZH07XG4gIHRyYW5zaXRpb246IGFsbCAwLjFzIGVhc2UtaW47XG5cbiAgJjpob3ZlciB7XG4gICAgYm9yZGVyOiAxcHggc29saWQgJHsoeyB0aGVtZSB9KSA9PiB0aGVtZS5jb2xvcnMucHJpbWFyeTYwfTtcbiAgICBib3gtc2hhZG93OiAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLnNoYWRvd3MuY2FyZEhvdmVyfTtcbiAgfVxuXG4gICYgLmRzYy1pY29uIHN2ZywgLmdoLWljb24gc3ZnIHtcbiAgICB3aWR0aDogNjRweDtcbiAgICBoZWlnaHQ6IDY0cHg7XG4gIH1cbmBcblxuQ2FyZC5kZWZhdWx0UHJvcHMgPSB7XG4gICAgdmFyaWFudDogJ2NvbnRhaW5lcicsXG4gICAgYm94U2hhZG93OiAnY2FyZCcsXG59XG5cbmV4cG9ydCBjb25zdCBEYXNoYm9hcmQ6IFJlYWN0LkZDID0gKCkgPT4ge1xuICAgIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlPERhc2hib2FyZERhdGE+KHt9KVxuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbGV0IGlzU3Vic2NyaWJlZCA9IHRydWVcbiAgICAgICAgYXBpLmdldERhc2hib2FyZCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNTdWJzY3JpYmVkKSB7XG4gICAgICAgICAgICAgICAgc2V0RGF0YShyZXNwb25zZS5kYXRhIGFzIERhc2hib2FyZERhdGEpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBpc1N1YnNjcmliZWQgPSBmYWxzZVxuICAgICAgICB9XG4gICAgfSwgW10pXG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8Qm94PlxuICAgICAgICAgICAgPERhc2hib2FyZEhlYWRlciAvPlxuICAgICAgICAgICAgPEJveFxuICAgICAgICAgICAgICAgIG10PXtbJ3hsJywgJ3hsJywgJy0xMDBweCddfVxuICAgICAgICAgICAgICAgIG1iPVwieGxcIlxuICAgICAgICAgICAgICAgIG14PXtbMCwgMCwgMCwgJ2F1dG8nXX1cbiAgICAgICAgICAgICAgICBweD17WydkZWZhdWx0JywgJ2xnJywgJ3h4bCcsICcwJ119XG4gICAgICAgICAgICAgICAgcG9zaXRpb249XCJyZWxhdGl2ZVwiXG4gICAgICAgICAgICAgICAgZmxleFxuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb249XCJyb3dcIlxuICAgICAgICAgICAgICAgIGZsZXhXcmFwPVwid3JhcFwiXG4gICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCJcbiAgICAgICAgICAgICAgICBhbGlnbkNvbnRlbnQ9XCJmbGV4LXN0YXJ0XCJcbiAgICAgICAgICAgICAgICB3aWR0aD17WzEsIDEsIDEsIDEwMjRdfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsvKiAxLiBTdGF0dXMgUmVnaXN0cmF0aW9ucyAqL31cbiAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMSAvIDJdfSBwPVwibGdcIj5cbiAgICAgICAgICAgICAgICAgICAgPENhcmQgYXM9XCJhXCIgZmxleD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggbWw9XCJ4bFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxIND5TdGF0dXMgUmVnaXN0cmF0aW9uczwvSDQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEucGVuZGluZ191c2VycyA/PyAwfSBSZWdpc3RyYXRpb25zIFBlbmRpbmc8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEub3ZlcmR1ZV9yZWdpc3RyYXRpb24gPz8gMH0gT3ZlcmR1ZSByZWdpc3RyYXRpb25zPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLndhaXRpbmdfbGlzdCA/PyAwfSBPbiB3YWl0aW5nIGxpc3Q8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEudG90YWxfdW51c2VkVm91Y2hlcnMgPz8gMH0gdW51c2VkIHZvdWNoZXJzPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICAgICA8L0JveD5cblxuICAgICAgICAgICAgICAgIHsvKiAyLiBTdGF0dXMgUHJvamVjdHMgKi99XG4gICAgICAgICAgICAgICAgPEJveCB3aWR0aD17WzEsIDEsIDEgLyAyXX0gcD1cImxnXCI+XG4gICAgICAgICAgICAgICAgICAgIDxDYXJkIGFzPVwiYVwiIGZsZXg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Qm94IG1sPVwieGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SDQ+U3RhdHVzIFByb2plY3RzPC9IND5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLnRvdGFsX3Byb2plY3RzID8/IDB9L3tkYXRhLm1heFJlZ2lzdHJhdGlvbiA/PyAwfSBQcm9qZWN0cyBSZW1haW5pbmcgLyB3aXRoeycgJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLnRvdGFsX3VzZWRWb3VjaGVycyA/PyAwfSBDby1Xb3JrZXIocylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeygoZGF0YS50b3RhbF91c2VycyB8fCAwKSAtIChkYXRhLnRvdGFsX3VzZWRWb3VjaGVycyB8fCAwKSAtIChkYXRhLnRvdGFsX3Byb2plY3RzIHx8IDApKX0gdXNlcihzKSB3aXRob3V0IFByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLnRvdGFsX3ZpZGVvcyA/PyAwfSBQcm9qZWN0KHMpIHdpdGggZm90by92aWRlbyBjb25maXJtZWQ8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICAgICAgIDwvQm94PlxuXG4gICAgICAgICAgICAgICAgey8qIDMuIFN0YXRpc3RpY3MgVXNlcnMgKi99XG4gICAgICAgICAgICAgICAgPEJveCB3aWR0aD17WzEsIDEsIDEgLyAyXX0gcD1cImxnXCI+XG4gICAgICAgICAgICAgICAgICAgIDxDYXJkIGFzPVwiYVwiIGZsZXg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Qm94IG1sPVwieGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SDQ+U3RhdGlzdGljcyBVc2VycyAodG90YWw6e2RhdGEudG90YWxfdXNlcnMgPz8gMH0pPC9IND5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Qm94IGZsZXggZmxleERpcmVjdGlvbj1cInJvd1wiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiIHBvc2l0aW9uPVwicmVsYXRpdmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJveCB3aWR0aD17WzEsIDEsIDEgLyAyXX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SDU+TGFuZ3VhZ2VzPC9INT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEudGxhbmdfbmwgfHwgMH0gbmw8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57ZGF0YS50bGFuZ19mciB8fCAwfSBmcjwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLnRsYW5nX2VuIHx8IDB9IGVuPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMSAvIDJdfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxINT5TZXg8L0g1PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57ZGF0YS50b3RhbF9mZW1hbGVzIHx8IDB9IGZlbWFsZXM8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57ZGF0YS50b3RhbF9tYWxlcyB8fCAwfSBtYWxlczwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLnRvdGFsX1ggfHwgMH0gWDwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAgICAgICAgICB7LyogNC4gQW5zd2VycyBUYWJsZSAqL31cbiAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMV19IHA9XCJsZ1wiPlxuICAgICAgICAgICAgICAgICAgICA8Q2FyZCBhcz1cImFcIiBmbGV4PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEJveCBtbD1cInhsXCIgd2lkdGg9XCIxMDAlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEg0PkFuc3dlcnMgY29udHJvbGUgbGlzdDwvSDQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVIZWFkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+dG90YWw8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPnNob3J0PC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5kZXNjcmlwdGlvbjwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZVJvdz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZUhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZGF0YS5xdWVzdGlvbnMgJiYgZGF0YS5xdWVzdGlvbnMubWFwKChxdWVzdGlvbikgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZVJvdyBrZXk9e3F1ZXN0aW9uLmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57cXVlc3Rpb24udG90YWx9PC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3F1ZXN0aW9uLnNob3J0fTwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPntxdWVzdGlvbi5kZXNjcmlwdGlvbn08L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVCb2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGU+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICAgICAgIDwvQm94PlxuXG4gICAgICAgICAgICAgICAgey8qIDUuIFQtU2hpcnRzIFRhYmxlICovfVxuICAgICAgICAgICAgICAgIDxCb3ggd2lkdGg9e1sxLCAxLCAxXX0gcD1cImxnXCI+XG4gICAgICAgICAgICAgICAgICAgIDxDYXJkIGFzPVwiYVwiIGZsZXg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Qm94IG1sPVwieGxcIiB3aWR0aD1cIjEwMCVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SDQ+VC1TaGlydHMgb3JkZXIgbGlzdDwvSDQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVIZWFkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD50b3RhbDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+c2hvcnQ8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPmRlc2NyaXB0aW9uPC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlSGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQm9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLnRzaGlydHMgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRzaGlydHMubWFwKCh0c2hpcnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlUm93IGtleT17dHNoaXJ0LmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3RzaGlydC50b3RhbH08L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3RzaGlydC5zaG9ydH08L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3RzaGlydC5kZXNjcmlwdGlvbn08L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZVJvdz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZUJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICAgICAgPC9Cb3g+ICAgICAgICBcbiAgICAgICAgICAgIDwvQm94PlxuICAgICAgICA8L0JveD5cbiAgICApXG59XG5leHBvcnQgZGVmYXVsdCBEYXNoYm9hcmQiLCJpbXBvcnQgeyBCb3gsIEJ1dHRvbiwgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuaW1wb3J0IHsgQmFzZVByb3BlcnR5Q29tcG9uZW50LCB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnO1xuaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5jb25zdCBQYXNzd29yZEVkaXQgPSAocHJvcHMpID0+IHtcbiAgICBjb25zdCB7IG9uQ2hhbmdlLCBwcm9wZXJ0eSwgcmVjb3JkLCByZXNvdXJjZSB9ID0gcHJvcHM7XG4gICAgY29uc3QgeyB0cmFuc2xhdGVCdXR0b246IHRiIH0gPSB1c2VUcmFuc2xhdGlvbigpO1xuICAgIGNvbnN0IFtzaG93UGFzc3dvcmQsIHRvZ2dsZVBhc3N3b3JkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoIXNob3dQYXNzd29yZCkge1xuICAgICAgICAgICAgb25DaGFuZ2UocHJvcGVydHkubmFtZSwgJycpO1xuICAgICAgICB9XG4gICAgfSwgW29uQ2hhbmdlLCBzaG93UGFzc3dvcmRdKTtcbiAgICAvLyBGb3IgbmV3IHJlY29yZHMgYWx3YXlzIHNob3cgdGhlIHByb3BlcnR5XG4gICAgaWYgKCFyZWNvcmQuaWQpIHtcbiAgICAgICAgcmV0dXJuIDxCYXNlUHJvcGVydHlDb21wb25lbnQuUGFzc3dvcmQuRWRpdCB7Li4ucHJvcHN9Lz47XG4gICAgfVxuICAgIHJldHVybiAoPEJveD5cbiAgICAgIHtzaG93UGFzc3dvcmQgJiYgPEJhc2VQcm9wZXJ0eUNvbXBvbmVudC5QYXNzd29yZC5FZGl0IHsuLi5wcm9wc30vPn1cbiAgICAgIDxCb3ggbWI9XCJ4bFwiPlxuICAgICAgICA8VGV4dCB0ZXh0QWxpZ249XCJjZW50ZXJcIj5cbiAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpID0+IHRvZ2dsZVBhc3N3b3JkKCFzaG93UGFzc3dvcmQpfSB0eXBlPVwiYnV0dG9uXCI+XG4gICAgICAgICAgICB7c2hvd1Bhc3N3b3JkID8gdGIoJ2NhbmNlbCcsIHJlc291cmNlLmlkKSA6IHRiKCdjaGFuZ2VQYXNzd29yZCcsIHJlc291cmNlLmlkKX1cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+KTtcbn07XG5leHBvcnQgZGVmYXVsdCBQYXNzd29yZEVkaXQ7XG4iLCJBZG1pbkpTLlVzZXJDb21wb25lbnRzID0ge31cbmltcG9ydCBMb2dpbiBmcm9tICcuLi9zcmMvY29tcG9uZW50cy9Mb2dpbidcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuTG9naW4gPSBMb2dpblxuaW1wb3J0IERhc2hib2FyZCBmcm9tICcuLi9zcmMvY29tcG9uZW50cy9EYXNoYm9hcmQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkRhc2hib2FyZCA9IERhc2hib2FyZFxuaW1wb3J0IFBhc3N3b3JkRWRpdENvbXBvbmVudCBmcm9tICcuLi8uLi8uLi9ub2RlX21vZHVsZXMvQGFkbWluanMvcGFzc3dvcmRzL2J1aWxkL2NvbXBvbmVudHMvUGFzc3dvcmRFZGl0Q29tcG9uZW50J1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5QYXNzd29yZEVkaXRDb21wb25lbnQgPSBQYXNzd29yZEVkaXRDb21wb25lbnQiXSwibmFtZXMiOlsiTG9naW4iLCJldmVudHMiLCJzZXRFdmVudHMiLCJ1c2VTdGF0ZSIsInNlbGVjdGVkRXZlbnQiLCJzZXRFdmVudCIsImlzTG9hZGluZyIsInNldElzTG9hZGluZyIsInVzZUVmZmVjdCIsImZldGNoRXZlbnRzIiwicmVzcG9uc2UiLCJmZXRjaCIsImRhdGEiLCJqc29uIiwiY3VycmVudEV2ZW50IiwiZmluZCIsImUiLCJpc0N1cnJlbnQiLCJlcnJvciIsImNvbnNvbGUiLCJSZWFjdCIsImNyZWF0ZUVsZW1lbnQiLCJCb3giLCJtYXJnaW4iLCJoZWlnaHQiLCJkaXNwbGF5IiwiZmxleERpcmVjdGlvbiIsImFsaWduSXRlbXMiLCJqdXN0aWZ5Q29udGVudCIsIm1ldGhvZCIsImFzIiwiSDEiLCJzdHlsZSIsIndpZHRoIiwiRm9ybUdyb3VwIiwiYWN0aW9uIiwiTGFiZWwiLCJodG1sRm9yIiwiSW5wdXQiLCJuYW1lIiwidHlwZSIsInZhcmlhbnQiLCJ2YWx1ZSIsIlNlbGVjdCIsIm9wdGlvbnMiLCJvbkNoYW5nZSIsImlzRGlzYWJsZWQiLCJsZW5ndGgiLCJCdXR0b24iLCJhcGkiLCJBcGlDbGllbnQiLCJwYWdlSGVhZGVySGVpZ2h0IiwicGFnZUhlYWRlclBhZGRpbmdZIiwicGFnZUhlYWRlclBhZGRpbmdYIiwieWVhciIsIm1vbnRoIiwiZGF5IiwiRGFzaGJvYXJkSGVhZGVyIiwic2V0RGF0YSIsImlzU3Vic2NyaWJlZCIsImdldERhc2hib2FyZCIsInRoZW4iLCJsb2ciLCJwb3NpdGlvbiIsIm92ZXJmbG93IiwiYmciLCJweSIsInB4IiwidGV4dEFsaWduIiwiY29sb3IiLCJmb250U2l6ZSIsImZvbnRXZWlnaHQiLCJldmVudF90aXRsZSIsIlRleHQiLCJvZmZpY2lhbFN0YXJ0RGF0ZSIsInVuZGVmaW5lZCIsIkludGwiLCJEYXRlVGltZUZvcm1hdCIsImZvcm1hdCIsIkRhdGUiLCJkYXlzX3JlbWFpbmluZyIsIkNhcmQiLCJzdHlsZWQiLCJmbGV4IiwidGhlbWUiLCJjb2xvcnMiLCJncmV5MTAwIiwic3BhY2UiLCJtZCIsInByaW1hcnk2MCIsInNoYWRvd3MiLCJjYXJkSG92ZXIiLCJkZWZhdWx0UHJvcHMiLCJib3hTaGFkb3ciLCJEYXNoYm9hcmQiLCJtdCIsIm1iIiwibXgiLCJmbGV4V3JhcCIsImFsaWduQ29udGVudCIsInAiLCJtbCIsIkg0IiwicGVuZGluZ191c2VycyIsIm92ZXJkdWVfcmVnaXN0cmF0aW9uIiwid2FpdGluZ19saXN0IiwidG90YWxfdW51c2VkVm91Y2hlcnMiLCJ0b3RhbF9wcm9qZWN0cyIsIm1heFJlZ2lzdHJhdGlvbiIsInRvdGFsX3VzZWRWb3VjaGVycyIsInRvdGFsX3VzZXJzIiwidG90YWxfdmlkZW9zIiwiSDUiLCJ0bGFuZ19ubCIsInRsYW5nX2ZyIiwidGxhbmdfZW4iLCJ0b3RhbF9mZW1hbGVzIiwidG90YWxfbWFsZXMiLCJ0b3RhbF9YIiwiVGFibGUiLCJUYWJsZUhlYWQiLCJUYWJsZVJvdyIsIlRhYmxlQ2VsbCIsIlRhYmxlQm9keSIsInF1ZXN0aW9ucyIsIm1hcCIsInF1ZXN0aW9uIiwia2V5IiwiaWQiLCJ0b3RhbCIsInNob3J0IiwiZGVzY3JpcHRpb24iLCJ0c2hpcnRzIiwidHNoaXJ0IiwiUGFzc3dvcmRFZGl0IiwicHJvcHMiLCJwcm9wZXJ0eSIsInJlY29yZCIsInJlc291cmNlIiwidHJhbnNsYXRlQnV0dG9uIiwidGIiLCJ1c2VUcmFuc2xhdGlvbiIsInNob3dQYXNzd29yZCIsInRvZ2dsZVBhc3N3b3JkIiwiQmFzZVByb3BlcnR5Q29tcG9uZW50IiwiUGFzc3dvcmQiLCJFZGl0Iiwib25DbGljayIsIkFkbWluSlMiLCJVc2VyQ29tcG9uZW50cyIsIlBhc3N3b3JkRWRpdENvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztFQUFBO0VBWUEsTUFBTUEsS0FBSyxHQUFHQSxNQUFNO0lB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
