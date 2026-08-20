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
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "Status Projects"), /*#__PURE__*/React__default.default.createElement("ul", null, /*#__PURE__*/React__default.default.createElement("li", null, data.total_projects ?? 0, "/", data.maxRegistration ?? 0, " Projects Remaining / with", ' ', data.total_usedVouchers ?? 0, " Co-Worker(s)"), /*#__PURE__*/React__default.default.createElement("li", null, (data.total_users || 0) - (data.total_usedVouchers || 0) - (data.total_projects || 0), " user(s) without Project"), /*#__PURE__*/React__default.default.createElement("li", null, data.total_videos ?? 0, " Project(s) with videos loaded"))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvY29tcG9uZW50cy9Mb2dpbi50c3giLCIuLi9zcmMvY29tcG9uZW50cy9EYXNoYm9hcmQudHN4IiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BhZG1pbmpzL3Bhc3N3b3Jkcy9idWlsZC9jb21wb25lbnRzL1Bhc3N3b3JkRWRpdENvbXBvbmVudC5qc3giLCJlbnRyeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzcmMvZnJvbnRlbmQvbG9naW4udHN4XG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7XG4gIEJveCxcbiAgQnV0dG9uLFxuICBJbnB1dCxcbiAgTGFiZWwsXG4gIEgxLFxuICBTZWxlY3QsXG4gIEZvcm1Hcm91cCxcbn0gZnJvbSBcIkBhZG1pbmpzL2Rlc2lnbi1zeXN0ZW1cIjtcblxuY29uc3QgTG9naW4gPSAoKSA9PiB7XG4gIGNvbnN0IFtldmVudHMsIHNldEV2ZW50c10gPSB1c2VTdGF0ZTxhbnlbXT4oW10pO1xuICBjb25zdCBbc2VsZWN0ZWRFdmVudCwgc2V0RXZlbnRdID0gdXNlU3RhdGU8YW55PihudWxsKTtcbiAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgZmV0Y2hFdmVudHMgPSBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCcvYXBpL2V2ZW50cycpO1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBzZXRFdmVudHMoZGF0YSk7XG4gICAgICAgIC8vIFByZS1zZWxlY3QgY3VycmVudCBldmVudCBpZiBhdmFpbGFibGVcbiAgICAgICAgY29uc3QgY3VycmVudEV2ZW50ID0gZGF0YS5maW5kKChlOiBhbnkpID0+IGUuaXNDdXJyZW50KTtcbiAgICAgICAgc2V0RXZlbnQoY3VycmVudEV2ZW50IHx8IGRhdGFbMF0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGZldGNoIGV2ZW50czonLCBlcnJvcik7XG4gICAgICAgIHNldEV2ZW50cyhbXSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgfVxuICAgIH07XG4gICAgZmV0Y2hFdmVudHMoKTtcbiAgfSwgW10pO1xuXG4gIHJldHVybiAoXG4gICAgPEJveFxuICAgICAgbWFyZ2luPVwiYXV0b1wiXG4gICAgICBoZWlnaHQ9XCIxMDB2aFwiXG4gICAgICBkaXNwbGF5PVwiZmxleFwiXG4gICAgICBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgIGFsaWduSXRlbXM9XCJjZW50ZXJcIlxuICAgICAganVzdGlmeUNvbnRlbnQ9XCJjZW50ZXJcIlxuICAgICAgbWV0aG9kPVwiUE9TVFwiIGFzPVwiZm9ybVwiXG4gICAgPlxuICAgICAgPEgxPkxvZ2luPC9IMT5cbiAgICAgIDxzZWN0aW9uIHN0eWxlPXt7IHdpZHRoOiBcIjQwMHB4XCIgfX0+XG4gICAgICAgIDxGb3JtR3JvdXAgYWN0aW9uPVwibG9naW5cIiA+XG4gICAgICAgICAgPExhYmVsIGh0bWxGb3I9XCJlbWFpbFwiPkFjY291bnQ8L0xhYmVsPlxuICAgICAgICAgIDxJbnB1dCBuYW1lPVwiZW1haWxcIiB0eXBlPVwidGV4dFwiIHZhcmlhbnQ9XCJkZWZhdWx0XCIgLz5cbiAgICAgICAgICA8TGFiZWwgaHRtbEZvcj1cInBhc3N3b3JkXCI+UGFzc3dvcmQ8L0xhYmVsPlxuICAgICAgICAgIDxJbnB1dCBuYW1lPVwicGFzc3dvcmRcIiB0eXBlPVwicGFzc3dvcmRcIiB2YXJpYW50PVwiZGVmYXVsdFwiIC8+XG4gICAgICAgICAgPExhYmVsIGh0bWxGb3I9XCJldmVudFwiPkV2ZW50PC9MYWJlbD5cbiAgICAgICAgICA8SW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJldmVudFwiIHZhbHVlPXtzZWxlY3RlZEV2ZW50Py52YWx1ZX0gLz5cbiAgICAgICAgICA8U2VsZWN0IFxuICAgICAgICAgICAgdmFyaWFudD1cImRlZmF1bHRcIiBcbiAgICAgICAgICAgIG9wdGlvbnM9e2V2ZW50c30gXG4gICAgICAgICAgICB2YWx1ZT17c2VsZWN0ZWRFdmVudH0gXG4gICAgICAgICAgICBvbkNoYW5nZT17c2V0RXZlbnR9XG4gICAgICAgICAgICBpc0xvYWRpbmc9e2lzTG9hZGluZ31cbiAgICAgICAgICAgIGlzRGlzYWJsZWQ9e2lzTG9hZGluZyB8fCBldmVudHMubGVuZ3RoID09PSAwfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvRm9ybUdyb3VwPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJwcmltYXJ5XCIgdHlwZT1cInN1Ym1pdFwiPkxvZ2luPC9CdXR0b24+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgPC9Cb3g+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBMb2dpbjtcbiIsImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBBcGlDbGllbnQgfSBmcm9tICdhZG1pbmpzJ1xuXG5pbXBvcnQgeyBcbiAgICBCb3gsIFxuICAgIEg0LFxuICAgIEg1LFxuICAgIFRhYmxlLFxuICAgIFRhYmxlUm93LFxuICAgIFRhYmxlQm9keSxcbiAgICBUYWJsZUNlbGwsXG4gICAgVGFibGVIZWFkLFxuICAgIFRleHQgXG59IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyBzdHlsZWQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtL3N0eWxlZC1jb21wb25lbnRzJ1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KClcblxuLy8gMS4gVW5pZWtlIGludGVyZmFjZSB2b29yIHRhYmVsaXRlbXMgKHZyYWdlbiAmIHQtc2hpcnRzKVxuaW50ZXJmYWNlIFRhYmxlSXRlbSB7XG4gICAgaWQ6IHN0cmluZyB8IG51bWJlclxuICAgIHRvdGFsOiBudW1iZXIgfCBzdHJpbmdcbiAgICBzaG9ydDogc3RyaW5nXG4gICAgZGVzY3JpcHRpb246IHN0cmluZ1xufVxuXG4vLyAyLiBIb29mZGludGVyZmFjZSB2b29yIGFsbGUgZGFzaGJvYXJkZ2VnZXZlbnNcbmludGVyZmFjZSBEYXNoYm9hcmREYXRhIHtcbiAgICBldmVudF90aXRsZT86IHN0cmluZ1xuICAgIG9mZmljaWFsU3RhcnREYXRlPzogc3RyaW5nXG4gICAgZGF5c19yZW1haW5pbmc/OiBudW1iZXJcbiAgICBwZW5kaW5nX3VzZXJzPzogbnVtYmVyXG4gICAgb3ZlcmR1ZV9yZWdpc3RyYXRpb24/OiBudW1iZXJcbiAgICB3YWl0aW5nX2xpc3Q/OiBudW1iZXJcbiAgICB0b3RhbF91bnVzZWRWb3VjaGVycz86IG51bWJlclxuICAgIHRvdGFsX3Byb2plY3RzPzogbnVtYmVyXG4gICAgbWF4UmVnaXN0cmF0aW9uPzogbnVtYmVyXG4gICAgdG90YWxfdXNlZFZvdWNoZXJzPzogbnVtYmVyXG4gICAgdG90YWxfdXNlcnM/OiBudW1iZXJcbiAgICB0b3RhbF92aWRlb3M/OiBudW1iZXJcbiAgICB0bGFuZ19ubD86IG51bWJlclxuICAgIHRsYW5nX2ZyPzogbnVtYmVyXG4gICAgdGxhbmdfZW4/OiBudW1iZXJcbiAgICB0b3RhbF9mZW1hbGVzPzogbnVtYmVyXG4gICAgdG90YWxfbWFsZXM/OiBudW1iZXJcbiAgICB0b3RhbF9YPzogbnVtYmVyXG4gICAgcXVlc3Rpb25zPzogVGFibGVJdGVtW11cbiAgICB0c2hpcnRzPzogVGFibGVJdGVtW11cbn1cblxuLy8gUHJvcHMgaW50ZXJmYWNlIHZvb3IgZGUgZ2VzdHlsZWRlIENhcmQgY29tcG9uZW50XG5pbnRlcmZhY2UgQ2FyZFByb3BzIHtcbiAgICBmbGV4PzogYm9vbGVhblxufVxuXG5jb25zdCBwYWdlSGVhZGVySGVpZ2h0ID0gMzAwXG5jb25zdCBwYWdlSGVhZGVyUGFkZGluZ1kgPSA1NFxuY29uc3QgcGFnZUhlYWRlclBhZGRpbmdYID0gMzAwXG5cbmNvbnN0IG9wdGlvbnM6IEludGwuRGF0ZVRpbWVGb3JtYXRPcHRpb25zID0ge1xuICAgIHllYXI6ICdudW1lcmljJyxcbiAgICBtb250aDogJzItZGlnaXQnLFxuICAgIGRheTogJzItZGlnaXQnXG59XG5cbmV4cG9ydCBjb25zdCBEYXNoYm9hcmRIZWFkZXI6IFJlYWN0LkZDID0gKCkgPT4ge1xuICAgIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlPERhc2hib2FyZERhdGE+KHt9KVxuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbGV0IGlzU3Vic2NyaWJlZCA9IHRydWVcbiAgICAgICAgYXBpLmdldERhc2hib2FyZCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZGFzaGJvYXJkLnRzeF8wMicsIHJlc3BvbnNlKVxuICAgICAgICAgICAgaWYgKGlzU3Vic2NyaWJlZCkge1xuICAgICAgICAgICAgICAgIHNldERhdGEocmVzcG9uc2UuZGF0YSBhcyBEYXNoYm9hcmREYXRhKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgaXNTdWJzY3JpYmVkID0gZmFsc2VcbiAgICAgICAgfVxuICAgIH0sIFtdKVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPEJveCBwb3NpdGlvbj1cInJlbGF0aXZlXCIgb3ZlcmZsb3c9XCJoaWRkZW5cIj5cbiAgICAgICAgICAgIDxCb3hcbiAgICAgICAgICAgICAgICBiZz1cImdyZXkxMDBcIlxuICAgICAgICAgICAgICAgIGhlaWdodD17cGFnZUhlYWRlckhlaWdodH1cbiAgICAgICAgICAgICAgICBweT17cGFnZUhlYWRlclBhZGRpbmdZfVxuICAgICAgICAgICAgICAgIHB4PXtbJ2RlZmF1bHQnLCAnbGcnLCBwYWdlSGVhZGVyUGFkZGluZ1hdfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxCb3ggdGV4dEFsaWduPVwiY2VudGVyXCIgY29sb3I9XCJ3aGl0ZVwiPlxuICAgICAgICAgICAgICAgICAgICA8aDIgc3R5bGU9e3sgZm9udFNpemU6ICczMnB4JywgZm9udFdlaWdodDogJ2JvbGQnLCBtYXJnaW46ICcxMHB4IDAnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAge2RhdGEuZXZlbnRfdGl0bGV9XG4gICAgICAgICAgICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgICAgICAgICAgIDxUZXh0PnN0YXJ0aW5nIG9uIDogeycgJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLm9mZmljaWFsU3RhcnREYXRlICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KCdlbi1CRScsIG9wdGlvbnMpLmZvcm1hdChuZXcgRGF0ZShkYXRhLm9mZmljaWFsU3RhcnREYXRlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdObyBldmVudCd9XG4gICAgICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgICAgICAgPFRleHQ+e2RhdGEuZGF5c19yZW1haW5pbmd9IGRheXMgcmVtYWluaW5nPC9UZXh0PlxuICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgIDwvQm94PlxuICAgIClcbn1cblxuLy8gVHlwZSBkZWZpbml0aWUgdm9vciBkZSBuYXZpZ2F0aWVibG9ra2VuIChpbmRpZW4gamUgZGV6ZSBsYXRlciB3aWwgcmVuZGVyZW4pXG50eXBlIEJveFR5cGUgPSB7XG4gICAgdGl0bGU6IHN0cmluZ1xuICAgIHN1YnRpdGxlOiBzdHJpbmdcbiAgICBocmVmOiBzdHJpbmdcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuY29uc3QgYm94ZXMgPSAoKTogQXJyYXk8Qm94VHlwZT4gPT4gW1xuICAgIHtcbiAgICAgICAgdGl0bGU6IFwiUmVnaXN0ZXJcIixcbiAgICAgICAgc3VidGl0bGU6IFwiUmVnaXN0ZXIgb24gYmVoYWxmIG9mIGEgcGFydGljaXBhbnRcIixcbiAgICAgICAgaHJlZjogJ2h0dHBzOi8vZG9jcy5hZG1pbmpzLmNvL2Jhc2ljcy9yZXNvdXJjZSNwcm92aWRpbmctcmVzb3VyY2VzLWV4cGxpY2l0bHknLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0aXRsZTogXCJVcGxvYWQgRm90b1wiLFxuICAgICAgICBzdWJ0aXRsZTogXCJVcGxvYWQgZm90b3Mgb24gYmVoYWxmIG9mIGEgcGFydGljaXBhbnRcIixcbiAgICAgICAgaHJlZjogJ2h0dHBzOi8vZG9jcy5hZG1pbmpzLmNvL2Jhc2ljcy9yZXNvdXJjZSNwcm92aWRpbmctcmVzb3VyY2VzLWV4cGxpY2l0bHknLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0aXRsZTogXCJTdGF0aXN0aWVrTmV3XCIsXG4gICAgICAgIHN1YnRpdGxlOiBcIlNob3cgc2V2ZXJhbCBzdGF0aXN0aWNzIGFib3V0IHRoZSBldmVudCBOZXdcIixcbiAgICAgICAgaHJlZjogJ2h0dHBzOi8vZG9jcy5hZG1pbmpzLmNvL2Jhc2ljcy9yZXNvdXJjZSNwcm92aWRpbmctcmVzb3VyY2VzLWV4cGxpY2l0bHknLFxuICAgIH0sXG5dXG5cbi8vIFZvbGxlZGlnIGdldHlwZWVyZGUgU3R5bGVkIENvbXBvbmVudFxuY29uc3QgQ2FyZCA9IHN0eWxlZChCb3gpPENhcmRQcm9wcz5gXG4gIGRpc3BsYXk6ICR7KHsgZmxleCB9KTogc3RyaW5nID0+IChmbGV4ID8gJ2ZsZXgnIDogJ2Jsb2NrJyl9O1xuICBjb2xvcjogJHsoeyB0aGVtZSB9KSA9PiB0aGVtZS5jb2xvcnMuZ3JleTEwMH07XG4gIGhlaWdodDogMTAwJTtcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICBib3JkZXI6IDFweCBzb2xpZCB0cmFuc3BhcmVudDtcbiAgYm9yZGVyLXJhZGl1czogJHsoeyB0aGVtZSB9KSA9PiB0aGVtZS5zcGFjZS5tZH07XG4gIHRyYW5zaXRpb246IGFsbCAwLjFzIGVhc2UtaW47XG5cbiAgJjpob3ZlciB7XG4gICAgYm9yZGVyOiAxcHggc29saWQgJHsoeyB0aGVtZSB9KSA9PiB0aGVtZS5jb2xvcnMucHJpbWFyeTYwfTtcbiAgICBib3gtc2hhZG93OiAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLnNoYWRvd3MuY2FyZEhvdmVyfTtcbiAgfVxuXG4gICYgLmRzYy1pY29uIHN2ZywgLmdoLWljb24gc3ZnIHtcbiAgICB3aWR0aDogNjRweDtcbiAgICBoZWlnaHQ6IDY0cHg7XG4gIH1cbmBcblxuQ2FyZC5kZWZhdWx0UHJvcHMgPSB7XG4gICAgdmFyaWFudDogJ2NvbnRhaW5lcicsXG4gICAgYm94U2hhZG93OiAnY2FyZCcsXG59XG5cbmV4cG9ydCBjb25zdCBEYXNoYm9hcmQ6IFJlYWN0LkZDID0gKCkgPT4ge1xuICAgIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlPERhc2hib2FyZERhdGE+KHt9KVxuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbGV0IGlzU3Vic2NyaWJlZCA9IHRydWVcbiAgICAgICAgYXBpLmdldERhc2hib2FyZCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNTdWJzY3JpYmVkKSB7XG4gICAgICAgICAgICAgICAgc2V0RGF0YShyZXNwb25zZS5kYXRhIGFzIERhc2hib2FyZERhdGEpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBpc1N1YnNjcmliZWQgPSBmYWxzZVxuICAgICAgICB9XG4gICAgfSwgW10pXG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8Qm94PlxuICAgICAgICAgICAgPERhc2hib2FyZEhlYWRlciAvPlxuICAgICAgICAgICAgPEJveFxuICAgICAgICAgICAgICAgIG10PXtbJ3hsJywgJ3hsJywgJy0xMDBweCddfVxuICAgICAgICAgICAgICAgIG1iPVwieGxcIlxuICAgICAgICAgICAgICAgIG14PXtbMCwgMCwgMCwgJ2F1dG8nXX1cbiAgICAgICAgICAgICAgICBweD17WydkZWZhdWx0JywgJ2xnJywgJ3h4bCcsICcwJ119XG4gICAgICAgICAgICAgICAgcG9zaXRpb249XCJyZWxhdGl2ZVwiXG4gICAgICAgICAgICAgICAgZmxleFxuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb249XCJyb3dcIlxuICAgICAgICAgICAgICAgIGZsZXhXcmFwPVwid3JhcFwiXG4gICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCJcbiAgICAgICAgICAgICAgICBhbGlnbkNvbnRlbnQ9XCJmbGV4LXN0YXJ0XCJcbiAgICAgICAgICAgICAgICB3aWR0aD17WzEsIDEsIDEsIDEwMjRdfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsvKiAxLiBTdGF0dXMgUmVnaXN0cmF0aW9ucyAqL31cbiAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMSAvIDJdfSBwPVwibGdcIj5cbiAgICAgICAgICAgICAgICAgICAgPENhcmQgYXM9XCJhXCIgZmxleD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggbWw9XCJ4bFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxIND5TdGF0dXMgUmVnaXN0cmF0aW9uczwvSDQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEucGVuZGluZ191c2VycyA/PyAwfSBSZWdpc3RyYXRpb25zIFBlbmRpbmc8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEub3ZlcmR1ZV9yZWdpc3RyYXRpb24gPz8gMH0gT3ZlcmR1ZSByZWdpc3RyYXRpb25zPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLndhaXRpbmdfbGlzdCA/PyAwfSBPbiB3YWl0aW5nIGxpc3Q8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEudG90YWxfdW51c2VkVm91Y2hlcnMgPz8gMH0gdW51c2VkIHZvdWNoZXJzPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICAgICA8L0JveD5cblxuICAgICAgICAgICAgICAgIHsvKiAyLiBTdGF0dXMgUHJvamVjdHMgKi99XG4gICAgICAgICAgICAgICAgPEJveCB3aWR0aD17WzEsIDEsIDEgLyAyXX0gcD1cImxnXCI+XG4gICAgICAgICAgICAgICAgICAgIDxDYXJkIGFzPVwiYVwiIGZsZXg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Qm94IG1sPVwieGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SDQ+U3RhdHVzIFByb2plY3RzPC9IND5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLnRvdGFsX3Byb2plY3RzID8/IDB9L3tkYXRhLm1heFJlZ2lzdHJhdGlvbiA/PyAwfSBQcm9qZWN0cyBSZW1haW5pbmcgLyB3aXRoeycgJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLnRvdGFsX3VzZWRWb3VjaGVycyA/PyAwfSBDby1Xb3JrZXIocylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeygoZGF0YS50b3RhbF91c2VycyB8fCAwKSAtIChkYXRhLnRvdGFsX3VzZWRWb3VjaGVycyB8fCAwKSAtIChkYXRhLnRvdGFsX3Byb2plY3RzIHx8IDApKX0gdXNlcihzKSB3aXRob3V0IFByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLnRvdGFsX3ZpZGVvcyA/PyAwfSBQcm9qZWN0KHMpIHdpdGggdmlkZW9zIGxvYWRlZDwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAgICAgICAgICB7LyogMy4gU3RhdGlzdGljcyBVc2VycyAqL31cbiAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMSAvIDJdfSBwPVwibGdcIj5cbiAgICAgICAgICAgICAgICAgICAgPENhcmQgYXM9XCJhXCIgZmxleD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggbWw9XCJ4bFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxIND5TdGF0aXN0aWNzIFVzZXJzICh0b3RhbDp7ZGF0YS50b3RhbF91c2VycyA/PyAwfSk8L0g0PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggZmxleCBmbGV4RGlyZWN0aW9uPVwicm93XCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgcG9zaXRpb249XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMSAvIDJdfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxINT5MYW5ndWFnZXM8L0g1PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57ZGF0YS50bGFuZ19ubCB8fCAwfSBubDwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLnRsYW5nX2ZyIHx8IDB9IGZyPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEudGxhbmdfZW4gfHwgMH0gZW48L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggd2lkdGg9e1sxLCAxLCAxIC8gMl19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEg1PlNleDwvSDU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLnRvdGFsX2ZlbWFsZXMgfHwgMH0gZmVtYWxlczwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLnRvdGFsX21hbGVzIHx8IDB9IG1hbGVzPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEudG90YWxfWCB8fCAwfSBYPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICAgICA8L0JveD5cblxuICAgICAgICAgICAgICAgIHsvKiA0LiBBbnN3ZXJzIFRhYmxlICovfVxuICAgICAgICAgICAgICAgIDxCb3ggd2lkdGg9e1sxLCAxLCAxXX0gcD1cImxnXCI+XG4gICAgICAgICAgICAgICAgICAgIDxDYXJkIGFzPVwiYVwiIGZsZXg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Qm94IG1sPVwieGxcIiB3aWR0aD1cIjEwMCVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SDQ+QW5zd2VycyBjb250cm9sZSBsaXN0PC9IND5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD50b3RhbDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+c2hvcnQ8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPmRlc2NyaXB0aW9uPC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlSGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQm9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLnF1ZXN0aW9ucyAmJiBkYXRhLnF1ZXN0aW9ucy5tYXAoKHF1ZXN0aW9uKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlUm93IGtleT17cXVlc3Rpb24uaWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPntxdWVzdGlvbi50b3RhbH08L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57cXVlc3Rpb24uc2hvcnR9PC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3F1ZXN0aW9uLmRlc2NyaXB0aW9ufTwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZUJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAgICAgICAgICB7LyogNS4gVC1TaGlydHMgVGFibGUgKi99XG4gICAgICAgICAgICAgICAgPEJveCB3aWR0aD17WzEsIDEsIDFdfSBwPVwibGdcIj5cbiAgICAgICAgICAgICAgICAgICAgPENhcmQgYXM9XCJhXCIgZmxleD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggbWw9XCJ4bFwiIHdpZHRoPVwiMTAwJVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxIND5ULVNoaXJ0cyBvcmRlciBsaXN0PC9IND5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZVJvdz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPnRvdGFsPC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5zaG9ydDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+ZGVzY3JpcHRpb248L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVIZWFkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVCb2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2RhdGEudHNoaXJ0cyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudHNoaXJ0cy5tYXAoKHRzaGlydCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVSb3cga2V5PXt0c2hpcnQuaWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57dHNoaXJ0LnRvdGFsfTwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57dHNoaXJ0LnNob3J0fTwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57dHNoaXJ0LmRlc2NyaXB0aW9ufTwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlQm9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICAgICA8L0JveD4gICAgICAgIFxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgIDwvQm94PlxuICAgIClcbn1cbmV4cG9ydCBkZWZhdWx0IERhc2hib2FyZCIsImltcG9ydCB7IEJveCwgQnV0dG9uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5pbXBvcnQgeyBCYXNlUHJvcGVydHlDb21wb25lbnQsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmNvbnN0IFBhc3N3b3JkRWRpdCA9IChwcm9wcykgPT4ge1xuICAgIGNvbnN0IHsgb25DaGFuZ2UsIHByb3BlcnR5LCByZWNvcmQsIHJlc291cmNlIH0gPSBwcm9wcztcbiAgICBjb25zdCB7IHRyYW5zbGF0ZUJ1dHRvbjogdGIgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG4gICAgY29uc3QgW3Nob3dQYXNzd29yZCwgdG9nZ2xlUGFzc3dvcmRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICghc2hvd1Bhc3N3b3JkKSB7XG4gICAgICAgICAgICBvbkNoYW5nZShwcm9wZXJ0eS5uYW1lLCAnJyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25DaGFuZ2UsIHNob3dQYXNzd29yZF0pO1xuICAgIC8vIEZvciBuZXcgcmVjb3JkcyBhbHdheXMgc2hvdyB0aGUgcHJvcGVydHlcbiAgICBpZiAoIXJlY29yZC5pZCkge1xuICAgICAgICByZXR1cm4gPEJhc2VQcm9wZXJ0eUNvbXBvbmVudC5QYXNzd29yZC5FZGl0IHsuLi5wcm9wc30vPjtcbiAgICB9XG4gICAgcmV0dXJuICg8Qm94PlxuICAgICAge3Nob3dQYXNzd29yZCAmJiA8QmFzZVByb3BlcnR5Q29tcG9uZW50LlBhc3N3b3JkLkVkaXQgey4uLnByb3BzfS8+fVxuICAgICAgPEJveCBtYj1cInhsXCI+XG4gICAgICAgIDxUZXh0IHRleHRBbGlnbj1cImNlbnRlclwiPlxuICAgICAgICAgIDxCdXR0b24gb25DbGljaz17KCkgPT4gdG9nZ2xlUGFzc3dvcmQoIXNob3dQYXNzd29yZCl9IHR5cGU9XCJidXR0b25cIj5cbiAgICAgICAgICAgIHtzaG93UGFzc3dvcmQgPyB0YignY2FuY2VsJywgcmVzb3VyY2UuaWQpIDogdGIoJ2NoYW5nZVBhc3N3b3JkJywgcmVzb3VyY2UuaWQpfVxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD4pO1xufTtcbmV4cG9ydCBkZWZhdWx0IFBhc3N3b3JkRWRpdDtcbiIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxuaW1wb3J0IExvZ2luIGZyb20gJy4uL3NyYy9jb21wb25lbnRzL0xvZ2luJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Mb2dpbiA9IExvZ2luXG5pbXBvcnQgRGFzaGJvYXJkIGZyb20gJy4uL3NyYy9jb21wb25lbnRzL0Rhc2hib2FyZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuRGFzaGJvYXJkID0gRGFzaGJvYXJkXG5pbXBvcnQgUGFzc3dvcmRFZGl0Q29tcG9uZW50IGZyb20gJy4uLy4uLy4uL25vZGVfbW9kdWxlcy9AYWRtaW5qcy9wYXNzd29yZHMvYnVpbGQvY29tcG9uZW50cy9QYXNzd29yZEVkaXRDb21wb25lbnQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlBhc3N3b3JkRWRpdENvbXBvbmVudCA9IFBhc3N3b3JkRWRpdENvbXBvbmVudCJdLCJuYW1lcyI6WyJMb2dpbiIsImV2ZW50cyIsInNldEV2ZW50cyIsInVzZVN0YXRlIiwic2VsZWN0ZWRFdmVudCIsInNldEV2ZW50IiwiaXNMb2FkaW5nIiwic2V0SXNMb2FkaW5nIiwidXNlRWZmZWN0IiwiZmV0Y2hFdmVudHMiLCJyZXNwb25zZSIsImZldGNoIiwiZGF0YSIsImpzb24iLCJjdXJyZW50RXZlbnQiLCJmaW5kIiwiZSIsImlzQ3VycmVudCIsImVycm9yIiwiY29uc29sZSIsIlJlYWN0IiwiY3JlYXRlRWxlbWVudCIsIkJveCIsIm1hcmdpbiIsImhlaWdodCIsImRpc3BsYXkiLCJmbGV4RGlyZWN0aW9uIiwiYWxpZ25JdGVtcyIsImp1c3RpZnlDb250ZW50IiwibWV0aG9kIiwiYXMiLCJIMSIsInN0eWxlIiwid2lkdGgiLCJGb3JtR3JvdXAiLCJhY3Rpb24iLCJMYWJlbCIsImh0bWxGb3IiLCJJbnB1dCIsIm5hbWUiLCJ0eXBlIiwidmFyaWFudCIsInZhbHVlIiwiU2VsZWN0Iiwib3B0aW9ucyIsIm9uQ2hhbmdlIiwiaXNEaXNhYmxlZCIsImxlbmd0aCIsIkJ1dHRvbiIsImFwaSIsIkFwaUNsaWVudCIsInBhZ2VIZWFkZXJIZWlnaHQiLCJwYWdlSGVhZGVyUGFkZGluZ1kiLCJwYWdlSGVhZGVyUGFkZGluZ1giLCJ5ZWFyIiwibW9udGgiLCJkYXkiLCJEYXNoYm9hcmRIZWFkZXIiLCJzZXREYXRhIiwiaXNTdWJzY3JpYmVkIiwiZ2V0RGFzaGJvYXJkIiwidGhlbiIsImxvZyIsInBvc2l0aW9uIiwib3ZlcmZsb3ciLCJiZyIsInB5IiwicHgiLCJ0ZXh0QWxpZ24iLCJjb2xvciIsImZvbnRTaXplIiwiZm9udFdlaWdodCIsImV2ZW50X3RpdGxlIiwiVGV4dCIsIm9mZmljaWFsU3RhcnREYXRlIiwidW5kZWZpbmVkIiwiSW50bCIsIkRhdGVUaW1lRm9ybWF0IiwiZm9ybWF0IiwiRGF0ZSIsImRheXNfcmVtYWluaW5nIiwiQ2FyZCIsInN0eWxlZCIsImZsZXgiLCJ0aGVtZSIsImNvbG9ycyIsImdyZXkxMDAiLCJzcGFjZSIsIm1kIiwicHJpbWFyeTYwIiwic2hhZG93cyIsImNhcmRIb3ZlciIsImRlZmF1bHRQcm9wcyIsImJveFNoYWRvdyIsIkRhc2hib2FyZCIsIm10IiwibWIiLCJteCIsImZsZXhXcmFwIiwiYWxpZ25Db250ZW50IiwicCIsIm1sIiwiSDQiLCJwZW5kaW5nX3VzZXJzIiwib3ZlcmR1ZV9yZWdpc3RyYXRpb24iLCJ3YWl0aW5nX2xpc3QiLCJ0b3RhbF91bnVzZWRWb3VjaGVycyIsInRvdGFsX3Byb2plY3RzIiwibWF4UmVnaXN0cmF0aW9uIiwidG90YWxfdXNlZFZvdWNoZXJzIiwidG90YWxfdXNlcnMiLCJ0b3RhbF92aWRlb3MiLCJINSIsInRsYW5nX25sIiwidGxhbmdfZnIiLCJ0bGFuZ19lbiIsInRvdGFsX2ZlbWFsZXMiLCJ0b3RhbF9tYWxlcyIsInRvdGFsX1giLCJUYWJsZSIsIlRhYmxlSGVhZCIsIlRhYmxlUm93IiwiVGFibGVDZWxsIiwiVGFibGVCb2R5IiwicXVlc3Rpb25zIiwibWFwIiwicXVlc3Rpb24iLCJrZXkiLCJpZCIsInRvdGFsIiwic2hvcnQiLCJkZXNjcmlwdGlvbiIsInRzaGlydHMiLCJ0c2hpcnQiLCJQYXNzd29yZEVkaXQiLCJwcm9wcyIsInByb3BlcnR5IiwicmVjb3JkIiwicmVzb3VyY2UiLCJ0cmFuc2xhdGVCdXR0b24iLCJ0YiIsInVzZVRyYW5zbGF0aW9uIiwic2hvd1Bhc3N3b3JkIiwidG9nZ2xlUGFzc3dvcmQiLCJCYXNlUHJvcGVydHlDb21wb25lbnQiLCJQYXNzd29yZCIsIkVkaXQiLCJvbkNsaWNrIiwiQWRtaW5KUyIsIlVzZXJDb21wb25lbnRzIiwiUGFzc3dvcmRFZGl0Q29tcG9uZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0VBQUE7RUFZQSxNQUFNQSxLQUFLLEdBQUdBLE1BQU07SUFDbEIsTUFB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
