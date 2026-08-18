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

  // Define interfaces for nested list structures

  const api = new adminjs.ApiClient();

  // Comprehensive interface matching your dashboard data shape

  const pageHeaderHeight = 300;
  const pageHeaderPaddingY = 54;
  const pageHeaderPaddingX = 300;
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const DashboardHeader = () => {
    // Initialize state with the specific data interface type
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
    }, data.event_title, " ", ' '), /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, "starting on :", data.officialStartDate !== undefined ? new Intl.DateTimeFormat('en-BE', options).format(new Date(data.officialStartDate)) : 'No event'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, data.days_remaining, " days remaining"))));
  };
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
      width: [1, 1, 1]
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H5, null, "Languages"), /*#__PURE__*/React__default.default.createElement("ul", null, /*#__PURE__*/React__default.default.createElement("li", null, data.tlang_nl || 0, " nl"), /*#__PURE__*/React__default.default.createElement("li", null, data.tlang_fr || 0, " fr"), /*#__PURE__*/React__default.default.createElement("li", null, data.tlang_en || 0, " en"))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1]
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H5, null, "Sex"), /*#__PURE__*/React__default.default.createElement("ul", null, /*#__PURE__*/React__default.default.createElement("li", null, data.total_females || 0, " females"), /*#__PURE__*/React__default.default.createElement("li", null, data.total_males || 0, " males"), /*#__PURE__*/React__default.default.createElement("li", null, data.total_X || 0, " X"))))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H5, null, "Answers"), /*#__PURE__*/React__default.default.createElement(designSystem.Table, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableHead, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "total"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "short"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "description"))), /*#__PURE__*/React__default.default.createElement(designSystem.TableBody, null, data.questions && data.questions.map(question => /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, {
      key: question.id
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, question.total), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, question.short), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, question.description)))))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H5, null, "T-Shirts"), /*#__PURE__*/React__default.default.createElement(designSystem.Table, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableHead, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "total"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "short"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "description"))), /*#__PURE__*/React__default.default.createElement(designSystem.TableBody, null, data.tshirts && data.tshirts.map(tshirt => /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvY29tcG9uZW50cy9Mb2dpbi50c3giLCIuLi9zcmMvY29tcG9uZW50cy9EYXNoYm9hcmQudHN4IiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BhZG1pbmpzL3Bhc3N3b3Jkcy9idWlsZC9jb21wb25lbnRzL1Bhc3N3b3JkRWRpdENvbXBvbmVudC5qc3giLCJlbnRyeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzcmMvZnJvbnRlbmQvbG9naW4udHN4XG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7XG4gIEJveCxcbiAgQnV0dG9uLFxuICBJbnB1dCxcbiAgTGFiZWwsXG4gIEgxLFxuICBTZWxlY3QsXG4gIEZvcm1Hcm91cCxcbn0gZnJvbSBcIkBhZG1pbmpzL2Rlc2lnbi1zeXN0ZW1cIjtcblxuY29uc3QgTG9naW4gPSAoKSA9PiB7XG4gIGNvbnN0IFtldmVudHMsIHNldEV2ZW50c10gPSB1c2VTdGF0ZTxhbnlbXT4oW10pO1xuICBjb25zdCBbc2VsZWN0ZWRFdmVudCwgc2V0RXZlbnRdID0gdXNlU3RhdGU8YW55PihudWxsKTtcbiAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgZmV0Y2hFdmVudHMgPSBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCcvYXBpL2V2ZW50cycpO1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBzZXRFdmVudHMoZGF0YSk7XG4gICAgICAgIC8vIFByZS1zZWxlY3QgY3VycmVudCBldmVudCBpZiBhdmFpbGFibGVcbiAgICAgICAgY29uc3QgY3VycmVudEV2ZW50ID0gZGF0YS5maW5kKChlOiBhbnkpID0+IGUuaXNDdXJyZW50KTtcbiAgICAgICAgc2V0RXZlbnQoY3VycmVudEV2ZW50IHx8IGRhdGFbMF0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGZldGNoIGV2ZW50czonLCBlcnJvcik7XG4gICAgICAgIHNldEV2ZW50cyhbXSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgfVxuICAgIH07XG4gICAgZmV0Y2hFdmVudHMoKTtcbiAgfSwgW10pO1xuXG4gIHJldHVybiAoXG4gICAgPEJveFxuICAgICAgbWFyZ2luPVwiYXV0b1wiXG4gICAgICBoZWlnaHQ9XCIxMDB2aFwiXG4gICAgICBkaXNwbGF5PVwiZmxleFwiXG4gICAgICBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgIGFsaWduSXRlbXM9XCJjZW50ZXJcIlxuICAgICAganVzdGlmeUNvbnRlbnQ9XCJjZW50ZXJcIlxuICAgICAgbWV0aG9kPVwiUE9TVFwiIGFzPVwiZm9ybVwiXG4gICAgPlxuICAgICAgPEgxPkxvZ2luPC9IMT5cbiAgICAgIDxzZWN0aW9uIHN0eWxlPXt7IHdpZHRoOiBcIjQwMHB4XCIgfX0+XG4gICAgICAgIDxGb3JtR3JvdXAgYWN0aW9uPVwibG9naW5cIiA+XG4gICAgICAgICAgPExhYmVsIGh0bWxGb3I9XCJlbWFpbFwiPkFjY291bnQ8L0xhYmVsPlxuICAgICAgICAgIDxJbnB1dCBuYW1lPVwiZW1haWxcIiB0eXBlPVwidGV4dFwiIHZhcmlhbnQ9XCJkZWZhdWx0XCIgLz5cbiAgICAgICAgICA8TGFiZWwgaHRtbEZvcj1cInBhc3N3b3JkXCI+UGFzc3dvcmQ8L0xhYmVsPlxuICAgICAgICAgIDxJbnB1dCBuYW1lPVwicGFzc3dvcmRcIiB0eXBlPVwicGFzc3dvcmRcIiB2YXJpYW50PVwiZGVmYXVsdFwiIC8+XG4gICAgICAgICAgPExhYmVsIGh0bWxGb3I9XCJldmVudFwiPkV2ZW50PC9MYWJlbD5cbiAgICAgICAgICA8SW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJldmVudFwiIHZhbHVlPXtzZWxlY3RlZEV2ZW50Py52YWx1ZX0gLz5cbiAgICAgICAgICA8U2VsZWN0IFxuICAgICAgICAgICAgdmFyaWFudD1cImRlZmF1bHRcIiBcbiAgICAgICAgICAgIG9wdGlvbnM9e2V2ZW50c30gXG4gICAgICAgICAgICB2YWx1ZT17c2VsZWN0ZWRFdmVudH0gXG4gICAgICAgICAgICBvbkNoYW5nZT17c2V0RXZlbnR9XG4gICAgICAgICAgICBpc0xvYWRpbmc9e2lzTG9hZGluZ31cbiAgICAgICAgICAgIGlzRGlzYWJsZWQ9e2lzTG9hZGluZyB8fCBldmVudHMubGVuZ3RoID09PSAwfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvRm9ybUdyb3VwPlxuICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJwcmltYXJ5XCIgdHlwZT1cInN1Ym1pdFwiPkxvZ2luPC9CdXR0b24+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgPC9Cb3g+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBMb2dpbjtcbiIsImltcG9ydCBSZWFjdCx7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSAgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBBcGlDbGllbnQgfSBmcm9tICdhZG1pbmpzJ1xuXG5pbXBvcnQgeyBCb3gsIFxuICAgIEJ1dHRvbiwgXG4gICAgSWxsdXN0cmF0aW9uLCBcbiAgICBJbGx1c3RyYXRpb25Qcm9wcywgXG4gICAgSDQsXG4gICAgSDUsXG4gICAgVGFibGUsXG4gICAgVGFibGVSb3csXG4gICAgVGFibGVCb2R5LFxuICAgIFRhYmxlQ2VsbCxcbiAgICBUYWJsZUhlYWQsXG4gICAgVGV4dCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyBzdHlsZWQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtL3N0eWxlZC1jb21wb25lbnRzJ1xuXG5pbXBvcnQgeyB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ2FkbWluanMnXG5cbi8vIERlZmluZSBpbnRlcmZhY2VzIGZvciBuZXN0ZWQgbGlzdCBzdHJ1Y3R1cmVzXG5pbnRlcmZhY2UgVGFibGVJdGVtIHtcbiAgICBpZDogc3RyaW5nIHwgbnVtYmVyXG4gICAgdG90YWw6IG51bWJlciB8IHN0cmluZ1xuICAgIHNob3J0OiBzdHJpbmdcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nXG59XG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KClcblxuLy8gQ29tcHJlaGVuc2l2ZSBpbnRlcmZhY2UgbWF0Y2hpbmcgeW91ciBkYXNoYm9hcmQgZGF0YSBzaGFwZVxuaW50ZXJmYWNlIERhc2hib2FyZERhdGEge1xuICAgIGV2ZW50X3RpdGxlPzogc3RyaW5nXG4gICAgb2ZmaWNpYWxTdGFydERhdGU/OiBzdHJpbmdcbiAgICBkYXlzX3JlbWFpbmluZz86IG51bWJlclxuICAgIHBlbmRpbmdfdXNlcnM/OiBudW1iZXJcbiAgICBvdmVyZHVlX3JlZ2lzdHJhdGlvbj86IG51bWJlclxuICAgIHdhaXRpbmdfbGlzdD86IG51bWJlclxuICAgIHRvdGFsX3VudXNlZFZvdWNoZXJzPzogbnVtYmVyXG4gICAgdG90YWxfcHJvamVjdHM/OiBudW1iZXJcbiAgICBtYXhSZWdpc3RyYXRpb24/OiBudW1iZXJcbiAgICB0b3RhbF91c2VkVm91Y2hlcnM/OiBudW1iZXJcbiAgICB0b3RhbF91c2Vycz86IG51bWJlclxuICAgIHRvdGFsX3ZpZGVvcz86IG51bWJlclxuICAgIHRsYW5nX25sPzogbnVtYmVyXG4gICAgdGxhbmdfZnI/OiBudW1iZXJcbiAgICB0bGFuZ19lbj86IG51bWJlclxuICAgIHRvdGFsX2ZlbWFsZXM/OiBudW1iZXJcbiAgICB0b3RhbF9tYWxlcz86IG51bWJlclxuICAgIHRvdGFsX1g/OiBudW1iZXJcbiAgICBxdWVzdGlvbnM/OiBUYWJsZUl0ZW1bXVxuICAgIHRzaGlydHM/OiBUYWJsZUl0ZW1bXVxufVxuXG5pbnRlcmZhY2UgQ2FyZFByb3BzIHtcbiAgICBmbGV4PzogYm9vbGVhblxufVxuXG5jb25zdCBwYWdlSGVhZGVySGVpZ2h0ID0gMzAwXG5jb25zdCBwYWdlSGVhZGVyUGFkZGluZ1kgPSA1NFxuY29uc3QgcGFnZUhlYWRlclBhZGRpbmdYID0gMzAwXG5cbmNvbnN0IG9wdGlvbnM6IEludGwuRGF0ZVRpbWVGb3JtYXRPcHRpb25zID0ge1xuICAgIHllYXI6ICdudW1lcmljJyxcbiAgICBtb250aDogJzItZGlnaXQnLFxuICAgIGRheTogJzItZGlnaXQnXG59XG5cbmV4cG9ydCBjb25zdCBEYXNoYm9hcmRIZWFkZXI6IFJlYWN0LkZDID0gKCkgPT4ge1xuICAgIC8vIEluaXRpYWxpemUgc3RhdGUgd2l0aCB0aGUgc3BlY2lmaWMgZGF0YSBpbnRlcmZhY2UgdHlwZVxuICAgIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlPERhc2hib2FyZERhdGE+KHt9KVxuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbGV0IGlzU3Vic2NyaWJlZCA9IHRydWVcbiAgICAgICAgYXBpLmdldERhc2hib2FyZCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZGFzaGJvYXJkLnRzeF8wMicsIHJlc3BvbnNlKVxuICAgICAgICAgICAgaWYgKGlzU3Vic2NyaWJlZCkge1xuICAgICAgICAgICAgICAgIHNldERhdGEocmVzcG9uc2UuZGF0YSBhcyBEYXNoYm9hcmREYXRhKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgaXNTdWJzY3JpYmVkID0gZmFsc2VcbiAgICAgICAgfVxuICAgIH0sIFtdKVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPEJveCBwb3NpdGlvbj1cInJlbGF0aXZlXCIgb3ZlcmZsb3c9XCJoaWRkZW5cIj5cbiAgICAgICAgICAgIDxCb3hcbiAgICAgICAgICAgICAgICBiZz1cImdyZXkxMDBcIlxuICAgICAgICAgICAgICAgIGhlaWdodD17cGFnZUhlYWRlckhlaWdodH1cbiAgICAgICAgICAgICAgICBweT17cGFnZUhlYWRlclBhZGRpbmdZfVxuICAgICAgICAgICAgICAgIHB4PXtbJ2RlZmF1bHQnLCAnbGcnLCBwYWdlSGVhZGVyUGFkZGluZ1hdfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxCb3ggdGV4dEFsaWduPVwiY2VudGVyXCIgY29sb3I9XCJ3aGl0ZVwiPlxuICAgICAgICAgICAgICAgICAgICA8aDIgc3R5bGU9e3sgZm9udFNpemU6ICczMnB4JywgZm9udFdlaWdodDogJ2JvbGQnLCBtYXJnaW46ICcxMHB4IDAnIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAge2RhdGEuZXZlbnRfdGl0bGV9IHsnICd9IFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgICAgICAgICAgIDxUZXh0PnN0YXJ0aW5nIG9uIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLm9mZmljaWFsU3RhcnREYXRlICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KCdlbi1CRScsIG9wdGlvbnMpLmZvcm1hdChuZXcgRGF0ZShkYXRhLm9mZmljaWFsU3RhcnREYXRlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdObyBldmVudCd9XG4gICAgICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgICAgICAgPFRleHQ+e2RhdGEuZGF5c19yZW1haW5pbmd9IGRheXMgcmVtYWluaW5nPC9UZXh0PlxuICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgIDwvQm94PlxuICAgIClcbn1cblxudHlwZSBCb3hUeXBlID0ge1xuICB0aXRsZTogc3RyaW5nXG4gIHN1YnRpdGxlOiBzdHJpbmdcbiAgaHJlZjogc3RyaW5nXG59XG5cbmNvbnN0IGJveGVzID0gKHsgdHJhbnNsYXRlTWVzc2FnZSB9KTogQXJyYXk8Qm94VHlwZT4gPT4gW1xuICB7XG4gICAgdGl0bGU6ICBcIlJlZ2lzdGVyXCIsXG4gICAgc3VidGl0bGU6IFwiUmVnaXN0ZXIgb24gYmVoYWxmIG9mIGEgcGFydGljaXBhbnRcIixcbiAgICBocmVmOiAnaHR0cHM6Ly9kb2NzLmFkbWluanMuY28vYmFzaWNzL3Jlc291cmNlI3Byb3ZpZGluZy1yZXNvdXJjZXMtZXhwbGljaXRseScsXG4gIH0sXG4gIHtcbiAgICB0aXRsZTogIFwiVXBsb2FkIEZvdG9cIixcbiAgICBzdWJ0aXRsZTogXCJVcGxvYWQgZm90b3Mgb24gYmVoYWxmIG9mIGEgcGFydGljaXBhbnRcIixcbiAgICBocmVmOiAnaHR0cHM6Ly9kb2NzLmFkbWluanMuY28vYmFzaWNzL3Jlc291cmNlI3Byb3ZpZGluZy1yZXNvdXJjZXMtZXhwbGljaXRseScsXG4gIH0sXG4gICAge1xuICAgIHRpdGxlOiAgXCJTdGF0aXN0aWVrTmV3XCIsXG4gICAgc3VidGl0bGU6IFwiU2hvdyBzZXZlcmFsIHN0YXRpc3RpY3MgYWJvdXQgdGhlIGV2ZW50IE5ld1wiLFxuICAgIGhyZWY6ICdodHRwczovL2RvY3MuYWRtaW5qcy5jby9iYXNpY3MvcmVzb3VyY2UjcHJvdmlkaW5nLXJlc291cmNlcy1leHBsaWNpdGx5JyxcbiAgfSxcbl1cblxuXG5cbmNvbnN0IENhcmQgPSBzdHlsZWQoQm94KWBcbiAgZGlzcGxheTogJHsoeyBmbGV4IH0pOiBzdHJpbmcgPT4gKGZsZXggPyAnZmxleCcgOiAnYmxvY2snKX07XG4gIGNvbG9yOiAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLmNvbG9ycy5ncmV5MTAwfTtcbiAgaGVpZ2h0OiAxMDAlO1xuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICBib3JkZXItcmFkaXVzOiAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLnNwYWNlLm1kfTtcbiAgdHJhbnNpdGlvbjogYWxsIDAuMXMgZWFzZS1pbjtcblxuICAmOmhvdmVyIHtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLmNvbG9ycy5wcmltYXJ5NjB9O1xuICAgIGJveC1zaGFkb3c6ICR7KHsgdGhlbWUgfSkgPT4gdGhlbWUuc2hhZG93cy5jYXJkSG92ZXJ9O1xuICB9XG5cbiAgJiAuZHNjLWljb24gc3ZnLCAuZ2gtaWNvbiBzdmcge1xuICAgIHdpZHRoOiA2NHB4O1xuICAgIGhlaWdodDogNjRweDtcbiAgfVxuYFxuXG5DYXJkLmRlZmF1bHRQcm9wcyA9IHtcbiAgdmFyaWFudDogJ2NvbnRhaW5lcicsXG4gIGJveFNoYWRvdzogJ2NhcmQnLFxufVxuXG5leHBvcnQgY29uc3QgRGFzaGJvYXJkOiBSZWFjdC5GQyA9ICgpID0+IHtcbiAgICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZTxEYXNoYm9hcmREYXRhPih7fSlcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxldCBpc1N1YnNjcmliZWQgPSB0cnVlXG4gICAgICAgIGFwaS5nZXREYXNoYm9hcmQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzU3Vic2NyaWJlZCkge1xuICAgICAgICAgICAgICAgIHNldERhdGEocmVzcG9uc2UuZGF0YSBhcyBEYXNoYm9hcmREYXRhKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgaXNTdWJzY3JpYmVkID0gZmFsc2VcbiAgICAgICAgfVxuICAgIH0sIFtdKVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPEJveD5cbiAgICAgICAgICAgIDxEYXNoYm9hcmRIZWFkZXIgLz5cbiAgICAgICAgICAgIDxCb3hcbiAgICAgICAgICAgICAgICBtdD17Wyd4bCcsICd4bCcsICctMTAwcHgnXX1cbiAgICAgICAgICAgICAgICBtYj1cInhsXCJcbiAgICAgICAgICAgICAgICBteD17WzAsIDAsIDAsICdhdXRvJ119XG4gICAgICAgICAgICAgICAgcHg9e1snZGVmYXVsdCcsICdsZycsICd4eGwnLCAnMCddfVxuICAgICAgICAgICAgICAgIHBvc2l0aW9uPVwicmVsYXRpdmVcIlxuICAgICAgICAgICAgICAgIGZsZXhcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uPVwicm93XCJcbiAgICAgICAgICAgICAgICBmbGV4V3JhcD1cIndyYXBcIlxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiXG4gICAgICAgICAgICAgICAgYWxpZ25Db250ZW50PVwiZmxleC1zdGFydFwiXG4gICAgICAgICAgICAgICAgd2lkdGg9e1sxLCAxLCAxLCAxMDI0XX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMSAvIDJdfSBwPVwibGdcIj5cbiAgICAgICAgICAgICAgICAgICAgPENhcmQgYXM9XCJhXCIgZmxleD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggbWw9XCJ4bFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxIND5TdGF0dXMgUmVnaXN0cmF0aW9uczwvSDQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEucGVuZGluZ191c2VycyA/PyAwfSBSZWdpc3RyYXRpb25zIFBlbmRpbmc8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEub3ZlcmR1ZV9yZWdpc3RyYXRpb24gPz8gMH0gT3ZlcmR1ZSByZWdpc3RyYXRpb25zPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLndhaXRpbmdfbGlzdCA/PyAwfSBPbiB3YWl0aW5nIGxpc3Q8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEudG90YWxfdW51c2VkVm91Y2hlcnMgPz8gMH0gdW51c2VkIHZvdWNoZXJzPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMSAvIDJdfSBwPVwibGdcIj5cbiAgICAgICAgICAgICAgICAgICAgPENhcmQgYXM9XCJhXCIgZmxleD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggbWw9XCJ4bFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxIND5TdGF0dXMgUHJvamVjdHM8L0g0PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2RhdGEudG90YWxfcHJvamVjdHMgPz8gMH0ve2RhdGEubWF4UmVnaXN0cmF0aW9uID8/IDB9IFByb2plY3RzIFJlbWFpbmluZyAvIHdpdGh7JyAnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2RhdGEudG90YWxfdXNlZFZvdWNoZXJzID8/IDB9IENvLVdvcmtlcihzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7KChkYXRhLnRvdGFsX3VzZXJzIHx8IDApIC0gKGRhdGEudG90YWxfdXNlZFZvdWNoZXJzIHx8IDApIC0gKGRhdGEudG90YWxfcHJvamVjdHMgfHwgMCkpfSB1c2VyKHMpIHdpdGhvdXQgUHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEudG90YWxfdmlkZW9zID8/IDB9IFByb2plY3Qocykgd2l0aCB2aWRlb3MgbG9hZGVkPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMSAvIDJdfSBwPVwibGdcIj5cbiAgICAgICAgICAgICAgICAgICAgPENhcmQgYXM9XCJhXCIgZmxleD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggbWw9XCJ4bFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxIND5TdGF0aXN0aWNzIFVzZXJzICh0b3RhbDp7ZGF0YS50b3RhbF91c2VycyA/PyAwfSk8L0g0PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggZmxleCBmbGV4RGlyZWN0aW9uPVwicm93XCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgcG9zaXRpb249XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMV19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEg1Pkxhbmd1YWdlczwvSDU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLnRsYW5nX25sIHx8IDB9IG5sPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEudGxhbmdfZnIgfHwgMH0gZnI8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57ZGF0YS50bGFuZ19lbiB8fCAwfSBlbjwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJveCB3aWR0aD17WzEsIDEsIDFdfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxINT5TZXg8L0g1PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57ZGF0YS50b3RhbF9mZW1hbGVzIHx8IDB9IGZlbWFsZXM8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57ZGF0YS50b3RhbF9tYWxlcyB8fCAwfSBtYWxlczwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLnRvdGFsX1ggfHwgMH0gWDwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgPEJveCB3aWR0aD17WzEsIDEsIDFdfSBwPVwibGdcIj5cbiAgICAgICAgICAgICAgICAgICAgPENhcmQgYXM9XCJhXCIgZmxleD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggbWw9XCJ4bFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxINT5BbnN3ZXJzPC9INT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD50b3RhbDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+c2hvcnQ8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPmRlc2NyaXB0aW9uPC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlSGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQm9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLnF1ZXN0aW9ucyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucXVlc3Rpb25zLm1hcCgocXVlc3Rpb24pID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlUm93IGtleT17cXVlc3Rpb24uaWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57cXVlc3Rpb24udG90YWx9PC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPntxdWVzdGlvbi5zaG9ydH08L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3F1ZXN0aW9uLmRlc2NyaXB0aW9ufTwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlQm9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMV19IHA9XCJsZ1wiPlxuICAgICAgICAgICAgICAgICAgICA8Q2FyZCBhcz1cImFcIiBmbGV4PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEJveCBtbD1cInhsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEg1PlQtU2hpcnRzPC9INT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD50b3RhbDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+c2hvcnQ8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPmRlc2NyaXB0aW9uPC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlSGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQm9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLnRzaGlydHMgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRzaGlydHMubWFwKCh0c2hpcnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlUm93IGtleT17dHNoaXJ0LmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3RzaGlydC50b3RhbH08L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3RzaGlydC5zaG9ydH08L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3RzaGlydC5kZXNjcmlwdGlvbn08L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZVJvdz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZUJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgPC9Cb3g+XG4gICAgKVxufVxuZXhwb3J0IGRlZmF1bHQgRGFzaGJvYXJkIiwiaW1wb3J0IHsgQm94LCBCdXR0b24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcbmltcG9ydCB7IEJhc2VQcm9wZXJ0eUNvbXBvbmVudCwgdXNlVHJhbnNsYXRpb24gfSBmcm9tICdhZG1pbmpzJztcbmltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuY29uc3QgUGFzc3dvcmRFZGl0ID0gKHByb3BzKSA9PiB7XG4gICAgY29uc3QgeyBvbkNoYW5nZSwgcHJvcGVydHksIHJlY29yZCwgcmVzb3VyY2UgfSA9IHByb3BzO1xuICAgIGNvbnN0IHsgdHJhbnNsYXRlQnV0dG9uOiB0YiB9ID0gdXNlVHJhbnNsYXRpb24oKTtcbiAgICBjb25zdCBbc2hvd1Bhc3N3b3JkLCB0b2dnbGVQYXNzd29yZF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKCFzaG93UGFzc3dvcmQpIHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKHByb3BlcnR5Lm5hbWUsICcnKTtcbiAgICAgICAgfVxuICAgIH0sIFtvbkNoYW5nZSwgc2hvd1Bhc3N3b3JkXSk7XG4gICAgLy8gRm9yIG5ldyByZWNvcmRzIGFsd2F5cyBzaG93IHRoZSBwcm9wZXJ0eVxuICAgIGlmICghcmVjb3JkLmlkKSB7XG4gICAgICAgIHJldHVybiA8QmFzZVByb3BlcnR5Q29tcG9uZW50LlBhc3N3b3JkLkVkaXQgey4uLnByb3BzfS8+O1xuICAgIH1cbiAgICByZXR1cm4gKDxCb3g+XG4gICAgICB7c2hvd1Bhc3N3b3JkICYmIDxCYXNlUHJvcGVydHlDb21wb25lbnQuUGFzc3dvcmQuRWRpdCB7Li4ucHJvcHN9Lz59XG4gICAgICA8Qm94IG1iPVwieGxcIj5cbiAgICAgICAgPFRleHQgdGV4dEFsaWduPVwiY2VudGVyXCI+XG4gICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB0b2dnbGVQYXNzd29yZCghc2hvd1Bhc3N3b3JkKX0gdHlwZT1cImJ1dHRvblwiPlxuICAgICAgICAgICAge3Nob3dQYXNzd29yZCA/IHRiKCdjYW5jZWwnLCByZXNvdXJjZS5pZCkgOiB0YignY2hhbmdlUGFzc3dvcmQnLCByZXNvdXJjZS5pZCl9XG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94Pik7XG59O1xuZXhwb3J0IGRlZmF1bHQgUGFzc3dvcmRFZGl0O1xuIiwiQWRtaW5KUy5Vc2VyQ29tcG9uZW50cyA9IHt9XG5pbXBvcnQgTG9naW4gZnJvbSAnLi4vc3JjL2NvbXBvbmVudHMvTG9naW4nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkxvZ2luID0gTG9naW5cbmltcG9ydCBEYXNoYm9hcmQgZnJvbSAnLi4vc3JjL2NvbXBvbmVudHMvRGFzaGJvYXJkJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5EYXNoYm9hcmQgPSBEYXNoYm9hcmRcbmltcG9ydCBQYXNzd29yZEVkaXRDb21wb25lbnQgZnJvbSAnLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BhZG1pbmpzL3Bhc3N3b3Jkcy9idWlsZC9jb21wb25lbnRzL1Bhc3N3b3JkRWRpdENvbXBvbmVudCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuUGFzc3dvcmRFZGl0Q29tcG9uZW50ID0gUGFzc3dvcmRFZGl0Q29tcG9uZW50Il0sIm5hbWVzIjpbIkxvZ2luIiwiZXZlbnRzIiwic2V0RXZlbnRzIiwidXNlU3RhdGUiLCJzZWxlY3RlZEV2ZW50Iiwic2V0RXZlbnQiLCJpc0xvYWRpbmciLCJzZXRJc0xvYWRpbmciLCJ1c2VFZmZlY3QiLCJmZXRjaEV2ZW50cyIsInJlc3BvbnNlIiwiZmV0Y2giLCJkYXRhIiwianNvbiIsImN1cnJlbnRFdmVudCIsImZpbmQiLCJlIiwiaXNDdXJyZW50IiwiZXJyb3IiLCJjb25zb2xlIiwiUmVhY3QiLCJjcmVhdGVFbGVtZW50IiwiQm94IiwibWFyZ2luIiwiaGVpZ2h0IiwiZGlzcGxheSIsImZsZXhEaXJlY3Rpb24iLCJhbGlnbkl0ZW1zIiwianVzdGlmeUNvbnRlbnQiLCJtZXRob2QiLCJhcyIsIkgxIiwic3R5bGUiLCJ3aWR0aCIsIkZvcm1Hcm91cCIsImFjdGlvbiIsIkxhYmVsIiwiaHRtbEZvciIsIklucHV0IiwibmFtZSIsInR5cGUiLCJ2YXJpYW50IiwidmFsdWUiLCJTZWxlY3QiLCJvcHRpb25zIiwib25DaGFuZ2UiLCJpc0Rpc2FibGVkIiwibGVuZ3RoIiwiQnV0dG9uIiwiYXBpIiwiQXBpQ2xpZW50IiwicGFnZUhlYWRlckhlaWdodCIsInBhZ2VIZWFkZXJQYWRkaW5nWSIsInBhZ2VIZWFkZXJQYWRkaW5nWCIsInllYXIiLCJtb250aCIsImRheSIsIkRhc2hib2FyZEhlYWRlciIsInNldERhdGEiLCJpc1N1YnNjcmliZWQiLCJnZXREYXNoYm9hcmQiLCJ0aGVuIiwibG9nIiwicG9zaXRpb24iLCJvdmVyZmxvdyIsImJnIiwicHkiLCJweCIsInRleHRBbGlnbiIsImNvbG9yIiwiZm9udFNpemUiLCJmb250V2VpZ2h0IiwiZXZlbnRfdGl0bGUiLCJUZXh0Iiwib2ZmaWNpYWxTdGFydERhdGUiLCJ1bmRlZmluZWQiLCJJbnRsIiwiRGF0ZVRpbWVGb3JtYXQiLCJmb3JtYXQiLCJEYXRlIiwiZGF5c19yZW1haW5pbmciLCJDYXJkIiwic3R5bGVkIiwiZmxleCIsInRoZW1lIiwiY29sb3JzIiwiZ3JleTEwMCIsInNwYWNlIiwibWQiLCJwcmltYXJ5NjAiLCJzaGFkb3dzIiwiY2FyZEhvdmVyIiwiZGVmYXVsdFByb3BzIiwiYm94U2hhZG93IiwiRGFzaGJvYXJkIiwibXQiLCJtYiIsIm14IiwiZmxleFdyYXAiLCJhbGlnbkNvbnRlbnQiLCJwIiwibWwiLCJINCIsInBlbmRpbmdfdXNlcnMiLCJvdmVyZHVlX3JlZ2lzdHJhdGlvbiIsIndhaXRpbmdfbGlzdCIsInRvdGFsX3VudXNlZFZvdWNoZXJzIiwidG90YWxfcHJvamVjdHMiLCJtYXhSZWdpc3RyYXRpb24iLCJ0b3RhbF91c2VkVm91Y2hlcnMiLCJ0b3RhbF91c2VycyIsInRvdGFsX3ZpZGVvcyIsIkg1IiwidGxhbmdfbmwiLCJ0bGFuZ19mciIsInRsYW5nX2VuIiwidG90YWxfZmVtYWxlcyIsInRvdGFsX21hbGVzIiwidG90YWxfWCIsIlRhYmxlIiwiVGFibGVIZWFkIiwiVGFibGVSb3ciLCJUYWJsZUNlbGwiLCJUYWJsZUJvZHkiLCJxdWVzdGlvbnMiLCJtYXAiLCJxdWVzdGlvbiIsImtleSIsImlkIiwidG90YWwiLCJzaG9ydCIsImRlc2NyaXB0aW9uIiwidHNoaXJ0cyIsInRzaGlydCIsIlBhc3N3b3JkRWRpdCIsInByb3BzIiwicHJvcGVydHkiLCJyZWNvcmQiLCJyZXNvdXJjZSIsInRyYW5zbGF0ZUJ1dHRvbiIsInRiIiwidXNlVHJhbnNsYXRpb24iLCJzaG93UGFzc3dvcmQiLCJ0b2dnbGVQYXNzd29yZCIsIkJhc2VQcm9wZXJ0eUNvbXBvbmVudCIsIlBhc3N3b3JkIiwiRWRpdCIsIm9uQ2xpY2siLCJBZG1pbkpTIiwiVXNlckNvbXBvbmVudHMiLCJQYXNzd29yZEVkaXRDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7RUFBQTtFQVlBLE1BQU1BLEtBQUssR0FBR0EsTUFBTTtJQUNsQixNQUFNLENBQUNDLE1BQU0sRUFBRUMsU0FBUyxDQUFDLEdBQUdDLGNBQVEsQ0FBUSxFQUFFLENBQUM7SUFDL0MsTUFBTSxDQUFDQyxhQUFhLEVBQUVDLFFBQVEsQ0FBQyxHQUFHRixjQUFRLENBQU0sSUFBSSxDQUFDO0lBQ3JELE1BQU0sQ0FBQ0csU0FBUyxFQUFFQyxZQUFZLENBQUMsR0FBR0osY0FBUSxDQUFDLElBQUksQ0FBQztFQUVoREssRUFBQUEsZUFBUyxDQUFDLE1BQU07RUFDZCxJQUFBLE1BQU1DLFdBQVcsR0FBRyxZQUFZO1FBQzlCLElBQUk7RUFDRixRQUFBLE1BQU1DLFFBQVEsR0FBRyxNQUFNQyxLQUFLLENBQUMsYUFBYSxDQUFDO0VBQzNDLFFBQUEsTUFBTUMsSUFB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
